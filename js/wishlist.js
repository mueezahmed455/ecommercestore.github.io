/**
 * Dragon-Tech Wishlist Module — v2.0 (Local-Only)
 * Renders wishlist sidebar, syncs badges, and integrates with storage-service.
 */
(function () {
  'use strict';

  function fmt(usd) { return window.currency ? window.currency.formatPrice(usd) : '$' + usd.toFixed(2); }
  function esc(s) { return window.utils ? window.utils.escapeHtml(s) : String(s); }

  function updateBadge() {
    var badge = document.getElementById('wishlistBadge');
    if (!badge) return;
    var count = window.storage ? window.storage.getWishlist().length : 0;
    badge.textContent = count;
    badge.classList.toggle('show', count > 0);
  }

  function renderWishlist() {
    var container = document.getElementById('wishlistItems');
    if (!container) return;

    var list = window.storage ? window.storage.getWishlist() : [];
    if (!list.length) {
      container.innerHTML =
        '<div class="cart-empty-state">' +
          '<div class="cart-empty-icon">💙</div>' +
          '<div class="cart-empty-text">Your wishlist is empty</div>' +
          '<a href="#products" class="btn btn-outline btn-sm" style="margin-top:10px;" id="browseFromWishlist">Browse Products</a>' +
        '</div>';
      var bfw = document.getElementById('browseFromWishlist');
      if (bfw) bfw.addEventListener('click', function () {
        var sidebar = document.getElementById('wishlistSidebar');
        var overlay = document.getElementById('cartOverlay');
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('open');
        document.body.style.overflow = '';
      });
      return;
    }

    container.innerHTML = list.map(function (id) {
      var p = window.getProductById ? window.getProductById(id) : null;
      if (!p) return '';
      var price = p.salePrice || p.price;
      return '<div class="cart-item-card" data-id="' + p.id + '">' +
        '<div class="cart-item-img"><img src="' + esc(p.image) + '" alt="' + esc(p.name) + '" loading="lazy"></div>' +
        '<div class="cart-item-info">' +
          '<div class="cart-item-name">' + esc(p.name) + '</div>' +
          '<div class="cart-item-price">' + fmt(price) + '</div>' +
          '<div style="display:flex;gap:6px;margin-top:8px;">' +
            '<button class="btn btn-primary btn-sm wl-add-cart" data-id="' + p.id + '">Add to Cart</button>' +
            '<button class="btn btn-ghost btn-sm wl-remove" data-id="' + p.id + '" style="color:var(--text-muted);">Remove</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    container.querySelectorAll('.wl-add-cart').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = this.dataset.id;
        if (window.cart) window.cart.addToCart(id);
      });
    });

    container.querySelectorAll('.wl-remove').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = this.dataset.id;
        if (window.storage) window.storage.toggleWishlist(id);
        renderWishlist();
        updateBadge();
        // Update card button state
        var cardBtn = document.querySelector('.wishlist-toggle[data-id="' + id + '"]');
        if (cardBtn) {
          cardBtn.classList.remove('active');
          var path = cardBtn.querySelector('path');
          if (path) path.setAttribute('fill', 'none');
        }
      });
    });
  }

  updateBadge();

  window.wishlist = {
    renderWishlist: renderWishlist,
    updateBadge:    updateBadge
  };

})();
