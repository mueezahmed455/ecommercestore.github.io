/**
 * Dragon-Tech Shopping Cart
 */
(function() {
  'use strict';

  var CART_KEY = 'dragon_cart';

  function getCart() {
    try {
      var cart = localStorage.getItem(CART_KEY);
      return cart ? JSON.parse(cart) : [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
  }

  function getProductById(id) {
    return window.getProductById ? window.getProductById(id) : null;
  }

  function showToast(message, type) {
    if (window.utils && window.utils.showToast) {
      window.utils.showToast(message, type);
    }
  }

  function formatPrice(amount) {
    if (window.currency && window.currency.formatPrice) {
      return window.currency.formatPrice(amount);
    }
    return '$' + amount.toFixed(2);
  }

  function addToCart(productId) {
    var cart = getCart();
    var existing = cart.filter(function(item) { return item.id === productId; })[0];

    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ id: productId, qty: 1 });
    }

    saveCart(cart);
    updateCartUI();
    showToast('Added to cart', 'success');
  }

  function removeFromCart(productId) {
    var cart = getCart().filter(function(item) { return item.id !== productId; });
    saveCart(cart);
    updateCartUI();
  }

  function updateQty(productId, delta) {
    var cart = getCart();
    var item = cart.filter(function(i) { return i.id === productId; })[0];
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
      removeFromCart(productId);
      return;
    }

    saveCart(cart);
    updateCartUI();
  }

  function getCartTotal() {
    var cart = getCart();
    return cart.reduce(function(total, item) {
      var product = getProductById(item.id);
      return total + (product ? (product.salePrice || product.price) * item.qty : 0);
    }, 0);
  }

  function getCartCount() {
    return getCart().reduce(function(count, item) { return count + item.qty; }, 0);
  }

  function updateCartUI() {
    var badge = document.getElementById('cartBadge');
    if (badge) {
      badge.textContent = getCartCount();
      badge.style.display = getCartCount() > 0 ? 'flex' : 'none';
    }

    var totalEl = document.getElementById('cartTotal');
    if (totalEl) {
      totalEl.textContent = formatPrice(getCartTotal());
    }

    var cartItemsEl = document.getElementById('cartItems');
    if (cartItemsEl) {
      renderCartItems(cartItemsEl);
    }

    var checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
      checkoutBtn.disabled = getCart().length === 0;
    }
  }

  function renderCartItems(container) {
    var cart = getCart();

    if (cart.length === 0) {
      container.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
      return;
    }

    container.innerHTML = cart.map(function(item) {
      var product = getProductById(item.id);
      if (!product) return '';

      var price = product.salePrice || product.price;
      return '<div class="cart-item">' +
        '<div class="cart-item-image">' +
          '<img src="' + product.image + '" alt="' + (product.name || 'Product') + '">' +
        '</div>' +
        '<div class="cart-item-details">' +
          '<div class="cart-item-name">' + (product.name || 'Product') + '</div>' +
          '<div class="cart-item-price">' + formatPrice(price) + '</div>' +
          '<div class="cart-item-qty">' +
            '<button class="qty-btn" data-id="' + product.id + '" data-action="dec">-</button>' +
            '<span>' + item.qty + '</span>' +
            '<button class="qty-btn" data-id="' + product.id + '" data-action="inc">+</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    container.querySelectorAll('.qty-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var productId = this.dataset.id;
        var action = this.dataset.action;
        var delta = action === 'inc' ? 1 : -1;
        updateQty(productId, delta);
      });
    });
  }

  window.cart = {
    getCart: getCart,
    addToCart: addToCart,
    removeFromCart: removeFromCart,
    updateQty: updateQty,
    getCartTotal: getCartTotal,
    getCartCount: getCartCount,
    updateCartUI: updateCartUI
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateCartUI);
  } else {
    updateCartUI();
  }

})();