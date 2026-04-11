/**
 * Recently Viewed Module
 * Tracks product views in localStorage and renders a scrollable strip.
 */
(function() {
  'use strict';

  var RECENTLY_VIEWED_STORAGE_KEY = 'dragon_recently_viewed';
  var MAX_RECENT = 8;

  // ---- Utilities ----

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function formatCurrency(amount) {
    return '$' + amount.toFixed(2);
  }

  function getProductById(id) {
    return window.getProductById ? window.getProductById(id) : null;
  }

  // ---- Persistence ----

  function getRecent() {
    try {
      var data = localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to parse recently viewed:', e);
      return [];
    }
  }

  function saveRecent(ids) {
    try {
      localStorage.setItem(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify(ids));
    } catch (e) {
      console.error('Failed to save recently viewed:', e);
    }
  }

  // ---- Tracking ----

  function trackView(productId) {
    var ids = getRecent();

    // Remove existing occurrence so re-viewed items jump to the front
    ids = ids.filter(function(id) { return id !== productId; });

    // Add to front
    ids.unshift(productId);

    // Cap at MAX_RECENT
    if (ids.length > MAX_RECENT) {
      ids = ids.slice(0, MAX_RECENT);
    }

    saveRecent(ids);
    renderRecentlyViewed();
  }

  // ---- Rendering ----

  function renderRecentlyViewed(containerId) {
    var container = document.getElementById(containerId || 'recentlyViewed');
    if (!container) return;

    var ids = getRecent();
    if (ids.length === 0) {
      container.innerHTML = '';
      container.style.display = 'none';
      return;
    }

    container.style.display = '';
    container.innerHTML =
      '<h3 class="recent-title">Recently Viewed</h3>' +
      '<div class="recent-scroll" role="list" aria-label="Recently viewed products">' +
        ids.map(function(productId) {
          var product = getProductById(productId);
          if (!product) return '';

          return '<div class="recent-card" role="listitem" data-product-id="' + productId + '" onclick="window.openProductModal(\'' + productId + '\')" tabindex="0" role="button" aria-label="View ' + escapeHtml(product.name) + '">' +
            '<div class="recent-card-image" aria-hidden="true">' +
              '<img src="' + product.image + '" alt="' + escapeHtml(product.name) + '">' +
            '</div>' +
            '<div class="recent-card-details">' +
              '<div class="recent-card-name">' + escapeHtml(product.name) + '</div>' +
              '<div class="recent-card-price">' + formatCurrency(product.price) + '</div>' +
            '</div>' +
          '</div>';
        }).join('') +
      '</div>';

    // Keyboard accessibility: Enter opens the product
    var cards = container.querySelectorAll('.recent-card');
    for (var i = 0; i < cards.length; i++) {
      (function(card, pid) {
        card.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (window.openProductModal) {
              window.openProductModal(pid);
            }
          }
        });
      })(cards[i], ids[i]);
    }
  }

  // ---- Initialize on load ----

  function init() {
    var container = document.getElementById('recentlyViewed');
    if (container) {
      renderRecentlyViewed('recentlyViewed');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ---- Public API ----

  window.recentlyViewed = {
    trackView: trackView,
    getRecent: getRecent,
    renderRecentlyViewed: renderRecentlyViewed,
    clear: function() { saveRecent([]); renderRecentlyViewed(); }
  };

})();
