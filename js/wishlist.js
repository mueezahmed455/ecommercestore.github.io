/**
 * Wishlist Module
 * Manages wishlist in localStorage. Exposes window.wishlist.
 */
(function() {
  'use strict';

  var WISHLIST_STORAGE_KEY = 'dragon_wishlist';

  // ---- Utilities ----

  

  

  

  function getProductById(id) {
    return window.getProductById ? window.getProductById(id) : null;
  }

  // ---- Wishlist persistence ----

  function getWishlist() {
    try {
      var data = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to parse wishlist:', e);
      return [];
    }
  }

  function saveWishlist(list) {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to save wishlist:', e);
    }
  }

  // ---- Wishlist operations ----

  function addToWishlist(productId) {
    var list = getWishlist();
    var already = list.indexOf(productId);
    if (already === -1) {
      list.push(productId);
      saveWishlist(list);
      showToast('Added to wishlist', 'success');
      renderWishlist();
    } else {
      showToast('Already in wishlist', 'info');
    }
  }

  function removeFromWishlist(productId) {
    var list = getWishlist().filter(function(id) { return id !== productId; });
    saveWishlist(list);
    renderWishlist();
  }

  function isInWishlist(productId) {
    return getWishlist().indexOf(productId) !== -1;
  }

  function clearWishlist() {
    saveWishlist([]);
    renderWishlist();
    showToast('Wishlist cleared', 'info');
  }

  // ---- Rendering ----

  function renderWishlist() {
    var container = document.getElementById('wishlistGrid');
    if (!container) return;

    var list = getWishlist();

    if (list.length === 0) {
      container.innerHTML = '<p class="empty-wishlist">Your wishlist is empty</p>';
      return;
    }

    container.innerHTML = list.map(function(productId) {
      var product = getProductById(productId);
      if (!product) return '';

      return '<div class="wishlist-item" data-product-id="' + productId + '">' +
        '<div class="wishlist-item-image" aria-hidden="true">' +
          '<img src="' + product.image + '" alt="' + escapeHtml(product.name) + '">' +
        '</div>' +
        '<div class="wishlist-item-details">' +
          '<div class="wishlist-item-name">' + escapeHtml(product.name) + '</div>' +
          '<div class="wishlist-item-price">' + formatCurrency(product.price) + '</div>' +
        '</div>' +
        '<div class="wishlist-item-actions">' +
          '<button class="btn btn-primary btn-sm" onclick="window.wishlist.moveToCart(\'' + productId + '\')">Move to Cart</button>' +
          '<button class="btn btn-ghost btn-sm" onclick="window.wishlist.removeFromWishlist(\'' + productId + '\')">Remove</button>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  function moveToCart(productId) {
    if (window.cart && window.cart.addToCart) {
      window.cart.addToCart(productId);
      removeFromWishlist(productId);
      showToast('Moved to cart', 'success');
    } else {
      showToast('Cart not available', 'error');
    }
  }

  // ---- Initialize on load ----

  function init() {
    if (document.getElementById('wishlistGrid')) {
      renderWishlist();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ---- Public API ----

  window.wishlist = {
    getWishlist: getWishlist,
    addToWishlist: addToWishlist,
    removeFromWishlist: removeFromWishlist,
    isInWishlist: isInWishlist,
    clearWishlist: clearWishlist,
    moveToCart: moveToCart,
    renderWishlist: renderWishlist
  };

})();
