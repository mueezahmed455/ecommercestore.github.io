/**
 * Referral System Module
 * Generates referral codes from Firebase UIDs, tracks referrals on checkout,
 * and provides a dashboard referral section.
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
   * @param {object} user - Firebase user object
   * @returns {string}
   */
  function getReferralCode(user) {
    if (!user || !user.uid) return '';
    return generateCode(user.uid);
  }

  /**
   * Get the full referral link for the current page.
   * @param {string} code - Referral code
   * @returns {string} Full URL with ?ref=CODE
   */
  function getReferralLink(code) {
    var baseUrl = window.location.origin + window.location.pathname;
    return baseUrl + '?ref=' + code;
  }

  /**
   * Copy the user's referral link to clipboard and show a toast.
   * @param {string} code - Referral code
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
   * Only stores if the referrer is not the current user.
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
   * Adds referralCode to order doc and increments referrer's count.
   * Call this from checkout flow before or after creating the order.
   *
   * @param {object} orderData - The order data being written
   * @returns {object} Modified orderData with referralCode field (if referral exists)
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
    // We need to find the user whose UID starts with this code
    await incrementReferralCount(referralCode);

    // Clear the referral storage so it isn't reused
    try {
      localStorage.removeItem(REFERRAL_STORAGE_KEY);
    } catch (e) { /* storage unavailable */ }

    return orderData;
  }

  /**
   * Find a user by their referral code prefix and increment their referral_count.
   * This is a best-effort operation -- errors are logged but not thrown.
   */
  async function incrementReferralCount(code) {
    if (!window.db || !window.db.firestore) return;

    try {
      var fbFirestore = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
      var usersRef = fbFirestore.collection(window.db.firestore, 'users');

      // Find user whose UID starts with the referral code
      var snapshot = await fbFirestore.getDocs(usersRef);
      snapshot.docs.forEach(function(docSnap) {
        var uid = docSnap.id;
        if (generateCode(uid) === code) {
          var userRef = fbFirestore.doc(window.db.firestore, 'users', uid);
          fbFirestore.updateDoc(userRef, {
            referral_count: fbFirestore.increment(1)
          }).catch(function(err) {
            console.error('Failed to increment referral count:', err);
          });
        }
      });
    } catch (error) {
      console.error('Failed to process referral increment:', error);
    }
  }

  /**
   * Render the referral section in the dashboard.
   * Shows the user's code, their link, a copy button, and referral count.
   *
   * @param {object} user - Firebase user object
   */
  async function renderReferralSection(user) {
    var section = document.getElementById('referralSection');
    if (!section || !user) return;

    var code = getReferralCode(user);
    var link = getReferralLink(code);

    // Fetch referral count from Firestore
    var referralCount = 0;
    if (window.db && window.db.firestore) {
      try {
        var fbFirestore = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        var userRef = fbFirestore.doc(window.db.firestore, 'users', user.uid);
        var snap = await fbFirestore.getDoc(userRef);
        if (snap.exists() && snap.data().referral_count) {
          referralCount = snap.data().referral_count;
        }
      } catch (error) {
        console.warn('Could not fetch referral count:', error);
      }
    }

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

  // ---- Hook into checkout ----

  /**
   * Patch window.cart.processCheckout to include referral data.
   * This is a non-destructive override that wraps the existing checkout.
   */
  function patchCheckoutForReferral() {
    if (!window.cart || !window.cart.processCheckout) return;

    var originalCheckout = window.cart.processCheckout;

    window.cart.processCheckout = async function() {
      // Run the original checkout
      await originalCheckout();

      // After checkout succeeds, record referral
      // Note: the cart module already handles order creation,
      // so we patch by adding referral to the most recent order.
      var referralCode;
      try {
        referralCode = localStorage.getItem(REFERRAL_STORAGE_KEY);
      } catch (e) {
        return;
      }
      if (!referralCode) return;

      // Find the most recent order for this user and add referral code
      if (window.db && window.db.auth && window.db.auth.currentUser && window.db.firestore) {
        try {
          var fbFirestore = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
          var ordersRef = fbFirestore.collection(window.db.firestore, 'orders');
          var q = fbFirestore.query(
            ordersRef,
            fbFirestore.where('userId', '==', window.db.auth.currentUser.uid),
            fbFirestore.orderBy('createdAt', 'desc'),
            fbFirestore.limit(1)
          );
          var snapshot = await fbFirestore.getDocs(q);
          if (!snapshot.empty) {
            var orderDoc = snapshot.docs[0];
            // Only update if referralCode is not already set
            if (!orderDoc.data().referralCode) {
              var orderRef = fbFirestore.doc(window.db.firestore, 'orders', orderDoc.id);
              await fbFirestore.updateDoc(orderRef, {
                referralCode: referralCode
              });
              await incrementReferralCount(referralCode);
            }
          }
          try {
            localStorage.removeItem(REFERRAL_STORAGE_KEY);
          } catch (e) { /* storage unavailable */ }
        } catch (error) {
          console.error('Failed to record referral on order:', error);
        }
      }
    };
  }

  // ---- Initialize ----

  function init() {
    // Always capture referral from URL on page load
    captureReferralFromUrl();

    // Patch checkout to record referrals
    if (window.cart && window.cart.processCheckout) {
      patchCheckoutForReferral();
    } else {
      // Cart not loaded yet; retry after a short delay
      setTimeout(function() {
        if (window.cart && window.cart.processCheckout) {
          patchCheckoutForReferral();
        }
      }, 500);
    }

    // Render referral section if element exists (dashboard page)
    var section = document.getElementById('referralSection');
    if (section && window.db && window.db.auth) {
      window.db.auth.onAuthStateChanged(function(user) {
        if (user) {
          renderReferralSection(user);
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
    renderReferralSection: renderReferralSection,
    patchCheckoutForReferral: patchCheckoutForReferral
  };

})();
