/**
 * Dragon-Tech Cart Module — v2.0
 * Persistent localStorage cart with coupon system, quantity management,
 * and dynamic UI updates integrated with the new design system.
 */
(function () {
  'use strict';

  var CART_KEY = 'dt_cart';

  // ---- Storage ----
  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch (e) { return []; }
  }

  function saveCart(cart) {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {}
  }

  // ---- Helpers ----
  function fmt(usd) {
    return window.currency ? window.currency.formatPrice(usd) : '$' + usd.toFixed(2);
  }

  function esc(s) { return window.utils ? window.utils.escapeHtml(s) : String(s); }

  function toast(msg, type) {
    if (window.utils) window.utils.showToast(msg, type || 'info');
  }

  function getProduct(id) {
    return window.getProductById ? window.getProductById(id) : null;
  }

  // ---- Cart operations ----
  function addToCart(productId) {
    var product = getProduct(productId);
    if (!product) { toast('Product not found', 'error'); return; }
    if (product.inStock === false) { toast('This item is out of stock', 'error'); return; }

    var cart = getCart();
    var item = cart.find(function (i) { return i.id === productId; });
    if (item) { item.qty++; }
    else { cart.push({ id: productId, qty: 1 }); }

    saveCart(cart);
    updateCartUI();
    toast('Added to cart — ' + product.name, 'success');

    if (window.storage) window.storage.logEvent('add_to_cart', { productId: productId });
  }

  function removeFromCart(productId) {
    saveCart(getCart().filter(function (i) { return i.id !== productId; }));
    updateCartUI();
  }

  function updateQty(productId, delta) {
    var cart = getCart();
    var item = cart.find(function (i) { return i.id === productId; });
    if (!item) return;
    item.qty = Math.max(0, item.qty + delta);
    if (item.qty === 0) return removeFromCart(productId);
    saveCart(cart);
    updateCartUI();
  }

  function setQty(productId, qty) {
    qty = parseInt(qty, 10);
    if (isNaN(qty) || qty < 1) return removeFromCart(productId);
    var cart = getCart();
    var item = cart.find(function (i) { return i.id === productId; });
    if (item) { item.qty = qty; saveCart(cart); updateCartUI(); }
  }

  function clearCart() { saveCart([]); updateCartUI(); }

  // ---- Calculations ----
  function getSubtotal() {
    return getCart().reduce(function (sum, item) {
      var p = getProduct(item.id);
      return sum + (p ? (p.salePrice || p.price) * item.qty : 0);
    }, 0);
  }

  function getCartCount() {
    return getCart().reduce(function (n, i) { return n + i.qty; }, 0);
  }

  function getDiscount(subtotal) {
    var coupon = window.getActiveCoupon ? window.getActiveCoupon() : null;
    if (!coupon) return 0;
    if (coupon.type === 'percent') return subtotal * coupon.value / 100;
    if (coupon.type === 'fixed')   return Math.min(coupon.value, subtotal);
    return 0;
  }

  function getTotal() {
    var sub = getSubtotal();
    return Math.max(0, sub - getDiscount(sub));
  }

  // ---- UI Rendering ----
  function renderCartItems(container) {
    var cart = getCart();
    var emptyState = document.getElementById('cartEmptyState');
    var cartFoot   = document.getElementById('cartFoot');

    if (cart.length === 0) {
      if (emptyState) emptyState.style.display = '';
      if (cartFoot)   cartFoot.style.display = 'none';
      container.innerHTML = '';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (cartFoot)   cartFoot.style.display = '';

    container.innerHTML = cart.map(function (item) {
      var p = getProduct(item.id);
      if (!p) return '';
      var price     = (p.salePrice || p.price) * item.qty;
      var unitPrice = p.salePrice || p.price;

      return '<div class="cart-item-card" data-id="' + p.id + '">' +
        '<div class="cart-item-img"><img src="' + esc(p.image) + '" alt="' + esc(p.name) + '"></div>' +
        '<div class="cart-item-info">' +
          '<div class="cart-item-name">' + esc(p.name) + '</div>' +
          '<div class="cart-item-price">' + fmt(unitPrice) + ' each</div>' +
          '<div class="qty-control">' +
            '<button class="qty-btn cart-dec" data-id="' + p.id + '" aria-label="Decrease">−</button>' +
            '<span class="qty-number">' + item.qty + '</span>' +
            '<button class="qty-btn cart-inc" data-id="' + p.id + '" aria-label="Increase">+</button>' +
          '</div>' +
        '</div>' +
        '<div class="cart-item-remove">' +
          '<button class="cart-remove-btn" data-id="' + p.id + '" aria-label="Remove from cart" style="color:var(--text-muted);background:none;border:none;cursor:pointer;padding:4px;">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
              '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>' +
            '</svg>' +
          '</button>' +
          '<div style="font-size:0.9rem;font-weight:700;color:var(--accent);margin-top:4px;">' + fmt(price) + '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    // Event listeners
    container.querySelectorAll('.cart-inc').forEach(function (btn) {
      btn.addEventListener('click', function () { updateQty(this.dataset.id, 1); });
    });
    container.querySelectorAll('.cart-dec').forEach(function (btn) {
      btn.addEventListener('click', function () { updateQty(this.dataset.id, -1); });
    });
    container.querySelectorAll('.cart-remove-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { removeFromCart(this.dataset.id); });
    });
  }

  function updateCartUI() {
    // Badge
    var badge = document.getElementById('cartBadge');
    var count = getCartCount();
    if (badge) {
      badge.textContent = count;
      badge.classList.toggle('show', count > 0);
    }

    // Items
    var itemsWrap = document.getElementById('cartItems');
    if (itemsWrap) renderCartItems(itemsWrap);

    // Totals
    var sub      = getSubtotal();
    var discount = getDiscount(sub);
    var total    = Math.max(0, sub - discount);

    var subtotalEl  = document.getElementById('cartSubtotal');
    var discountRow = document.getElementById('discountRow');
    var discountEl  = document.getElementById('cartDiscount');
    var totalEl     = document.getElementById('cartTotal');
    var shippingEl  = document.getElementById('cartShipping');

    if (subtotalEl) subtotalEl.textContent = fmt(sub);
    if (discountRow) discountRow.style.display = discount > 0 ? '' : 'none';
    if (discountEl) discountEl.textContent = '−' + fmt(discount);
    if (totalEl)    totalEl.textContent = fmt(total);
    if (shippingEl) shippingEl.textContent = sub >= 50 ? 'Free' : fmt(4.99);

    var checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) checkoutBtn.disabled = count === 0;
  }

  // ---- Checkout ----
  function processCheckout() {
    var user = window.storage ? window.storage.getCurrentUser() : null;
    if (!user) {
      toast('Please sign in to checkout', 'warning');
      setTimeout(function () {
        var prefix = window.location.pathname.includes('/pages/') ? '' : 'pages/';
        window.location.href = prefix + 'login.html?redirect=checkout';
      }, 1200);
      return;
    }

    var cart = getCart();
    if (!cart.length) { toast('Your cart is empty', 'error'); return; }

    var sub      = getSubtotal();
    var discount = getDiscount(sub);
    var total    = Math.max(0, sub - discount);
    var coupon   = window.getActiveCoupon ? window.getActiveCoupon() : null;

    var orderData = {
      userId:    user.uid,
      userName:  user.name,
      userEmail: user.email,
      items: cart.map(function (item) {
        var p = getProduct(item.id);
        return {
          id:    item.id,
          name:  p ? p.name : 'Unknown',
          image: p ? p.image : '',
          price: p ? (p.salePrice || p.price) : 0,
          qty:   item.qty
        };
      }),
      subtotal:     sub,
      discountCode: coupon ? coupon.code : null,
      discount:     discount,
      shipping:     sub >= 50 ? 0 : 4.99,
      total:        total + (sub >= 50 ? 0 : 4.99),
      status:       'processing'
    };

    try {
      var order = window.storage.saveOrder(orderData);
      clearCart();

      if (window.storage) window.storage.logEvent('purchase', { orderId: order.id, total: order.total });

      toast('Order placed! Redirecting…', 'success');
      setTimeout(function () {
        var prefix = window.location.pathname.includes('/pages/') ? '' : 'pages/';
        window.location.href = prefix + 'confirmation.html?id=' + order.id;
      }, 1000);
    } catch (err) {
      toast('Checkout failed: ' + err.message, 'error');
    }
  }

  // ---- Public API ----
  window.cart = {
    getCart:         getCart,
    addToCart:       addToCart,
    removeFromCart:  removeFromCart,
    updateQty:       updateQty,
    setQty:          setQty,
    clearCart:       clearCart,
    getSubtotal:     getSubtotal,
    getCartCount:    getCartCount,
    getTotal:        getTotal,
    updateCartUI:    updateCartUI,
    processCheckout: processCheckout
  };

  // Init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateCartUI);
  } else { updateCartUI(); }

})();