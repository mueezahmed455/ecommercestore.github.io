/**
 * Referral System Module
 * Generates referral codes from UIDs, tracks referrals on checkout,
 * and provides a dashboard referral section.
 * Pure local version using window.storage and localStorage.
 */
(function() {
  'use strict';

  var REFERRAL_STORAGE_KEY = 'dragon_referral';
  var CODE_LENGTH = 8;

  // ---- Utilities ----

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function showToast(message, type) {
    if (window.utils && window.utils.showToast) {
      window.utils.showToast(message, type);
    }
  }

  /**
   * Generate referral code: first 8 chars of UID, uppercased.
   */
  function generateCode(uid) {
    if (!uid) return '';
    return uid.substring(0, CODE_LENGTH).toUpperCase();
  }

  /**
   * Get query parameter from the current URL.
   */
  function getQueryParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  /**
   * Copy text to clipboard.
   */
  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    // Fallback for older browsers
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return Promise.resolve();
    } catch (e) {
      document.body.removeChild(textarea);
      return Promise.reject(e);
    }
  }

  // ---- Public API ----

  /**
   * Get the referral code for the current logged-in user.
   */
  function getReferralCode(user) {
    if (!user || !user.uid) return '';
    return generateCode(user.uid);
  }

  /**
   * Get the full referral link for the current page.
   */
  function getReferralLink(code) {
    var baseUrl = window.location.origin + window.location.pathname;
    // Handle pages/ directory
    if (baseUrl.endsWith('dashboard.html')) {
        baseUrl = baseUrl.replace('pages/dashboard.html', 'index.html');
    }
    return baseUrl + '?ref=' + code;
  }

  /**
   * Copy the user's referral link to clipboard and show a toast.
   */
  function copyReferralLink(code) {
    var link = getReferralLink(code);
    copyToClipboard(link).then(function() {
      showToast('Referral link copied to clipboard!', 'success');
    }).catch(function() {
      showToast('Failed to copy link', 'error');
    });
  }

  /**
   * On page load: check URL for ?ref=CODE and store in localStorage.
   */
  function captureReferralFromUrl() {
    var refCode = getQueryParam('ref');
    if (!refCode) return;

    // Clean the URL (remove ?ref= from address bar without reload)
    if (window.history && window.history.replaceState) {
      var cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, cleanUrl);
    }

    try {
      localStorage.setItem(REFERRAL_STORAGE_KEY, refCode.toUpperCase());
    } catch (e) { /* storage unavailable */ }
  }

  /**
   * Record a referral when an order is placed.
   */
  async function recordReferralOnCheckout(orderData) {
    var referralCode;
    try {
      referralCode = localStorage.getItem(REFERRAL_STORAGE_KEY);
    } catch (e) {
      return orderData;
    }

    if (!referralCode) return orderData;

    // Add referral code to the order
    orderData.referralCode = referralCode;

    // Increment the referral count for the referrer
    incrementReferralCount(referralCode);

    // Clear the referral storage so it isn't reused
    try {
      localStorage.removeItem(REFERRAL_STORAGE_KEY);
    } catch (e) { /* storage unavailable */ }

    return orderData;
  }

  /**
   * Find a user by their referral code prefix and increment their referral_count.
   */
  function incrementReferralCount(code) {
    if (!window.storage || !window.storage.getUsers) return;

    try {
      var users = window.storage.getUsers();
      var referrer = users.find(u => generateCode(u.uid) === code);
      if (referrer) {
        referrer.referral_count = (referrer.referral_count || 0) + 1;
        // In this local version, users list is in localStorage
        localStorage.setItem('dragon_users', JSON.stringify(users));
      }
    } catch (error) {
      console.error('Failed to process referral increment:', error);
    }
  }

  /**
   * Render the referral section in the dashboard.
   */
  function renderReferralSection(user) {
    var section = document.getElementById('referralSection');
    if (!section || !user) return;

    var code = getReferralCode(user);
    var link = getReferralLink(code);

    // Fetch referral count from local storage
    var referralCount = user.referral_count || 0;

    section.innerHTML =
      '<div class="referral-content">' +
        '<div class="referral-header">' +
          '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
            '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>' +
            '<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>' +
          '</svg>' +
          '<h3>Refer a Friend</h3>' +
        '</div>' +
        '<div class="referral-code-display">' +
          '<span class="referral-label">Your Code</span>' +
          '<span class="referral-code" id="referralCodeDisplay">' + escapeHtml(code) + '</span>' +
        '</div>' +
        '<div class="referral-link-row">' +
          '<input type="text" class="referral-link-input" value="' + escapeHtml(link) + '" readonly id="referralLinkInput">' +
          '<button class="btn btn-primary" id="copyReferralBtn" type="button">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
              '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>' +
              '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>' +
            '</svg>' +
            'Copy Link' +
          '</button>' +
        '</div>' +
        '<div class="referral-stats">' +
          '<span class="referral-stat">' +
            '<span class="referral-stat-value">' + referralCount + '</span>' +
            '<span class="referral-stat-label">Friends Referred</span>' +
          '</span>' +
        '</div>' +
        '<p class="referral-hint">Share your link and earn rewards when friends make their first purchase!</p>' +
      '</div>';

    // Wire up copy button
    var copyBtn = document.getElementById('copyReferralBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', function() {
        copyReferralLink(code);
      });
    }
  }

  // ---- Initialize ----

  function init() {
    captureReferralFromUrl();

    // Render referral section if element exists (dashboard page)
    var section = document.getElementById('referralSection');
    if (section && window.storage) {
        var user = window.storage.getCurrentUser();
        if (user) {
            renderReferralSection(user);
        }
        
        window.addEventListener('auth-change', function(e) {
            if (e.detail) {
                renderReferralSection(e.detail);
            }
        });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose public API
  window.referral = {
    getReferralCode: getReferralCode,
    getReferralLink: getReferralLink,
    copyReferralLink: copyReferralLink,
    captureReferralFromUrl: captureReferralFromUrl,
    recordReferralOnCheckout: recordReferralOnCheckout,
    renderReferralSection: renderReferralSection
  };

})();
