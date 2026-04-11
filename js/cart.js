/**
 * Shopping Cart Module - Enhanced with Delivery Options
 * Uses localStorage for persistence. Exposes window.cart.
 */
(function() {
  'use strict';

  var CART_STORAGE_KEY = 'dragon_cart';
  var DELIVERY_STORAGE_KEY = 'dragon_delivery';
  var COUPON_STORAGE_KEY = 'dragon_coupon';
  var CRM_COUPON_THRESHOLD = window.CRM_COUPON_THRESHOLD || 100;
  var FREE_SHIPPING_THRESHOLD = 100;

  // Delivery options configuration
  var DELIVERY_OPTIONS = {
    standard: { price: 4.99, daysMin: 5, daysMax: 7, label: 'Standard Shipping' },
    express: { price: 9.99, daysMin: 2, daysMax: 3, label: 'Express Shipping' },
    priority: { price: 19.99, daysMin: 1, daysMax: 1, label: 'Priority Overnight' }
  };

  // ---- Shared utilities ----

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function formatCurrency(amount) {
    if (window.currency) return window.currency.formatPrice(amount);
    return '$' + amount.toFixed(2);
  }

  function showToast(message, type) {
    var toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = 'toast ' + (type || 'info');
    toast.classList.add('show');
    setTimeout(function() { toast.classList.remove('show'); }, 3000);
  }

  function getProductById(id) {
    return window.getProductById ? window.getProductById(id) : null;
  }

  // ---- Helper: Calculate delivery date range ----

  function calculateDeliveryDate(daysMin, daysMax) {
    var today = new Date();
    var startDate = new Date(today);
    var endDate = new Date(today);
    startDate.setDate(startDate.getDate() + daysMin);
    endDate.setDate(endDate.getDate() + daysMax);

    var options = { month: 'short', day: 'numeric' };
    return startDate.toLocaleDateString('en-US', options) + ' - ' + endDate.toLocaleDateString('en-US', options);
  }

  // ---- Cart persistence ----

  function getCart() {
    try {
      var cart = localStorage.getItem(CART_STORAGE_KEY);
      return cart ? JSON.parse(cart) : [];
    } catch (e) {
      console.error('Failed to parse cart:', e);
      return [];
    }
  }

  function saveCart(cart) {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
  }

  // ---- Delivery selection ----

  function getSelectedDelivery() {
    try {
      var selected = localStorage.getItem(DELIVERY_STORAGE_KEY);
      return selected && DELIVERY_OPTIONS[selected] ? selected : 'standard';
    } catch (e) {
      return 'standard';
    }
  }

  function setSelectedDelivery(method) {
    try {
      localStorage.setItem(DELIVERY_STORAGE_KEY, method);
    } catch (e) {
      console.error('Failed to save delivery method:', e);
    }
  }

  // ---- Coupon handling ----

  function getCoupon() {
    try {
      var coupon = localStorage.getItem(COUPON_STORAGE_KEY);
      return coupon ? JSON.parse(coupon) : null;
    } catch (e) {
      return null;
    }
  }

  function setCoupon(couponData) {
    try {
      localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(couponData));
    } catch (e) {
      console.error('Failed to save coupon:', e);
    }
  }

  function clearCoupon() {
    try {
      localStorage.removeItem(COUPON_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear coupon:', e);
    }
  }

  // ---- Cart operations ----

  function addToCart(productId) {
    var cart = getCart();
    var existing = cart.find(function(item) { return item.id === productId; });

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
    var item = cart.find(function(i) { return i.id === productId; });
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
      removeFromCart(productId);
      return;
    }

    saveCart(cart);
    updateCartUI();
  }

  function clearCart() {
    saveCart([]);
    clearCoupon();
    updateCartUI();
  }

  function getCartTotal() {
    var cart = getCart();
    return cart.reduce(function(total, item) {
      var product = getProductById(item.id);
      return total + (product ? product.price * item.qty : 0);
    }, 0);
  }

  function getCartCount() {
    return getCart().reduce(function(count, item) { return count + item.qty; }, 0);
  }

  function getShippingCost() {
    var subtotal = getCartTotal();
    if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
    var deliveryMethod = getSelectedDelivery();
    return DELIVERY_OPTIONS[deliveryMethod].price;
  }

  function getDiscountAmount() {
    var coupon = getCoupon();
    if (!coupon) return 0;
    var subtotal = getCartTotal();
    if (coupon.type === 'percent') {
      return subtotal * (coupon.value / 100);
    } else if (coupon.type === 'fixed') {
      return Math.min(coupon.value, subtotal);
    }
    return 0;
  }

  function getOrderTotal() {
    var subtotal = getCartTotal();
    var shipping = getShippingCost();
    var discount = getDiscountAmount();
    return subtotal + shipping - discount;
  }

  // ---- UI updates ----

  function updateCartUI() {
    var badge = document.getElementById('cartBadge');
    if (badge) badge.textContent = getCartCount();

    var cartItemsEl = document.getElementById('cartItems');
    if (cartItemsEl) renderCartItems(cartItemsEl);

    var deliverySection = document.getElementById('cartDelivery');
    var cart = getCart();
    if (deliverySection) {
      deliverySection.style.display = cart.length > 0 ? 'block' : 'none';
    }

    updateOrderSummary();
    updateFreeShippingProgress();
    updateDeliveryDates();

    var checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) checkoutBtn.disabled = cart.length === 0;
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

      return '<div class="cart-item" data-product-id="' + item.id + '">' +
        '<div class="cart-item-image" aria-hidden="true">' +
          '<img src="' + product.image + '" alt="' + escapeHtml(product.name) + '">' +
        '</div>' +
        '<div class="cart-item-details">' +
          '<div class="cart-item-name">' + escapeHtml(product.name) + '</div>' +
          '<div class="cart-item-price price-display" data-price-usd="' + (product.price * item.qty) + '">' + formatCurrency(product.price * item.qty) + '</div>' +
          '<div class="cart-item-qty">' +
            '<button class="qty-btn" aria-label="Decrease quantity" data-action="decrease" data-product="' + item.id + '">\u2212</button>' +
            '<span>' + item.qty + '</span>' +
            '<button class="qty-btn" aria-label="Increase quantity" data-action="increase" data-product="' + item.id + '">+</button>' +
          '</div>' +
          '<button class="cart-item-remove" data-action="remove" data-product="' + item.id + '" aria-label="Remove ' + escapeHtml(product.name) + '">' + (window.i18n ? window.i18n.t('remove_item') : 'Remove') + '</button>' +
        '</div>' +
      '</div>';
    }).join('');

    // Attach event listeners
    container.querySelectorAll('.qty-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var productId = this.getAttribute('data-product');
        var action = this.getAttribute('data-action');
        var delta = action === 'increase' ? 1 : -1;
        updateQty(productId, delta);
      });
    });

    container.querySelectorAll('.cart-item-remove').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var productId = this.getAttribute('data-product');
        removeFromCart(productId);
      });
    });
  }

  function updateOrderSummary() {
    var subtotal = getCartTotal();
    var shipping = getShippingCost();
    var discount = getDiscountAmount();
    var total = getOrderTotal();

    var subtotalEl = document.getElementById('orderSubtotal');
    var shippingEl = document.getElementById('orderShipping');
    var discountRow = document.getElementById('discountRow');
    var discountEl = document.getElementById('orderDiscount');
    var couponBadge = document.getElementById('couponBadge');
    var totalEl = document.getElementById('orderTotal');

    if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
    if (shippingEl) {
      shippingEl.textContent = shipping === 0 ? 'FREE' : formatCurrency(shipping);
      if (shipping === 0) shippingEl.style.color = 'var(--neon-green)';
    }

    if (discount > 0) {
      if (discountRow) discountRow.style.display = 'flex';
      if (discountEl) discountEl.textContent = '-' + formatCurrency(discount);
      var coupon = getCoupon();
      if (couponBadge && coupon) {
        couponBadge.textContent = coupon.code;
        couponBadge.style.display = 'inline-block';
      }
    } else {
      if (discountRow) discountRow.style.display = 'none';
    }

    if (totalEl) totalEl.textContent = formatCurrency(total);
  }

  function updateFreeShippingProgress() {
    var subtotal = getCartTotal();
    var progressContainer = document.getElementById('freeShippingProgress');
    if (!progressContainer) return;

    if (subtotal >= FREE_SHIPPING_THRESHOLD) {
      progressContainer.classList.add('completed');
      document.getElementById('progressText').textContent = '\u2705 You unlocked FREE shipping!';
      document.getElementById('progressPercent').textContent = '100%';
      document.getElementById('progressFill').style.width = '100%';
    } else {
      var remaining = FREE_SHIPPING_THRESHOLD - subtotal;
      var percent = Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100);
      progressContainer.classList.remove('completed');
      document.getElementById('progressText').textContent = formatCurrency(remaining) + ' away from FREE shipping!';
      document.getElementById('progressPercent').textContent = percent + '%';
      document.getElementById('progressFill').style.width = percent + '%';
    }
  }

  function updateDeliveryDates() {
    Object.keys(DELIVERY_OPTIONS).forEach(function(method) {
      var option = DELIVERY_OPTIONS[method];
      var etaText = calculateDeliveryDate(option.daysMin, option.daysMax);
      var etaEl = document.getElementById('eta' + method.charAt(0).toUpperCase() + method.slice(1));
      if (etaEl) etaEl.textContent = 'Arrives: ' + etaText;
    });
  }

  function applyCoupon(code) {
    if (!code || code.trim() === '') {
      showToast('Please enter a coupon code', 'error');
      return;
    }

    // Mock coupon validation (replace with actual API call)
    var validCoupons = {
      'DRAGON10': { type: 'percent', value: 10, code: 'DRAGON10' },
      'DRAGON20': { type: 'percent', value: 20, code: 'DRAGON20' },
      'SAVE15': { type: 'fixed', value: 15, code: 'SAVE15' }
    };

    var coupon = validCoupons[code.toUpperCase()];
    if (coupon) {
      setCoupon(coupon);
      showToast('Coupon applied: ' + (coupon.type === 'percent' ? coupon.value + '% off' : formatCurrency(coupon.value) + ' off'), 'success');
      updateOrderSummary();
      return coupon;
    } else {
      showToast('Invalid coupon code', 'error');
      return null;
    }
  }

  function removeCoupon() {
    clearCoupon();
    showToast('Coupon removed', 'info');
    updateOrderSummary();
  }

  // ---- Checkout ----

  async function processCheckout() {
    var cart = getCart();
    if (cart.length === 0) return;

    if (!window.db || !window.db.auth || !window.db.auth.currentUser) {
      showToast('Please sign in to checkout', 'error');
      window.location.href = 'pages/login.html';
      return;
    }

    var checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) checkoutBtn.disabled = true;

    var overlay = document.getElementById('stripeModalOverlay');
    if (!overlay) {
      showToast('Payment system not ready', 'error');
      return;
    }
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    if (!window.stripeInitialized) {
      try {
        var stripe = Stripe('pk_test_TYooMQauvdEDq54NiTphI7jx');
        var elements = stripe.elements();
        var card = elements.create('card', {
          style: {
            base: { color: '#000', fontFamily: 'Inter, sans-serif', fontSize: '16px', '::placeholder': { color: '#888' } },
          }
        });
        card.mount('#card-element');

        card.on('change', function(event) {
          var displayError = document.getElementById('card-errors');
          if (event.error) {
            displayError.textContent = event.error.message;
          } else {
            displayError.textContent = '';
          }
        });

        var form = document.getElementById('payment-form');
        form.addEventListener('submit', async function(event) {
          event.preventDefault();
          var submitBtn = document.getElementById('submitPaymentBtn');
          submitBtn.disabled = true;
          submitBtn.textContent = 'Processing...';

          try {
            const { paymentMethod, error } = await stripe.createPaymentMethod({
              type: 'card',
              card: card,
            });

            if (error) {
              document.getElementById('card-errors').textContent = error.message;
              submitBtn.disabled = false;
              submitBtn.textContent = 'Pay Now';
              return;
            }

            await finalizeOrder(paymentMethod.id);
            document.getElementById('stripeModalOverlay').style.display = 'none';
            document.body.style.overflow = '';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Pay Now';
          } catch (err) {
            console.error(err);
            document.getElementById('card-errors').textContent = err.message || 'Payment failed';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Pay Now';
          }
        });

        document.getElementById('cancelPaymentBtn').addEventListener('click', function() {
          document.getElementById('stripeModalOverlay').style.display = 'none';
          document.body.style.overflow = '';
          if (checkoutBtn) checkoutBtn.disabled = false;
        });

        window.stripeInitialized = true;
      } catch(e) {
        console.error('Stripe error', e);
        showToast('Payment gateway error', 'error');
      }
    }
  }

  async function finalizeOrder(paymentMethodId) {
    var cart = getCart();
    if (!cart || cart.length === 0) throw new Error("Cart is empty");

    var checkoutBtn = document.getElementById('checkoutBtn');
    var deliveryMethod = getSelectedDelivery();
    var coupon = getCoupon();

    try {
      var fbFirestore = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
      var doc = fbFirestore.doc;
      var updateDoc = fbFirestore.updateDoc;
      var increment = fbFirestore.increment;
      var collection = fbFirestore.collection;
      var addDoc = fbFirestore.addDoc;
      var serverTimestamp = fbFirestore.serverTimestamp;

      var user = window.db.auth.currentUser;
      var subtotal = getCartTotal();
      var shipping = getShippingCost();
      var discount = getDiscountAmount();
      var total = subtotal + shipping - discount;

      // Update user total_spent
      var userRef = doc(window.db.firestore, 'users', user.uid);
      await updateDoc(userRef, { total_spent: increment(subtotal) });

      // Record order with delivery info
      await addDoc(collection(window.db.firestore, 'orders'), {
        userId: user.uid,
        items: cart.map(function(item) {
          var product = getProductById(item.id);
          return { productId: item.id, qty: item.qty, price: product ? product.price : 0 };
        }),
        subtotal: subtotal,
        shipping: shipping,
        deliveryMethod: deliveryMethod,
        discount: discount,
        couponCode: coupon ? coupon.code : null,
        total: total,
        status: 'completed',
        createdAt: serverTimestamp()
      });

      // Check coupon threshold
      if (subtotal >= CRM_COUPON_THRESHOLD) {
        await triggerCouponEmail(user);
      }

      clearCart();
      showToast('Order placed successfully!', 'success');

      var cartSidebar = document.getElementById('cartSidebar');
      if (cartSidebar) cartSidebar.classList.remove('open');
      var cartOverlay = document.getElementById('cartOverlay');
      if (cartOverlay) cartOverlay.classList.remove('open');

    } catch (error) {
      console.error('Checkout failed:', error);
      showToast('Checkout failed. Please try again.', 'error');
      throw error;
    } finally {
      if (checkoutBtn) {
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = 'Proceed to Checkout';
      }
    }
  }

  // ---- Coupon email trigger ----

  async function triggerCouponEmail(user) {
    try {
      var FUNCTIONS_BASE_URL = window.FUNCTIONS_BASE_URL || 'https://YOUR_REGION-YOUR_PROJECT_ID.cloudfunctions.net';

      var response = await fetch(FUNCTIONS_BASE_URL + '/sendCouponEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          email: user.email,
          name: user.displayName || 'Valued Customer'
        })
      });

      if (!response.ok) {
        console.error('Failed to trigger coupon email');
      }
    } catch (error) {
      console.error('Coupon email trigger failed:', error);
    }
  }

  // ---- Initialize on load ----

  function initDeliveryOptions() {
    // Radio button listeners
    document.querySelectorAll('input[name="deliveryMethod"]').forEach(function(radio) {
      radio.addEventListener('change', function() {
        setSelectedDelivery(this.value);
        updateOrderSummary();
      });
    });

    // Set initial selection
    var selected = getSelectedDelivery();
    var radio = document.querySelector('input[name="deliveryMethod"][value="' + selected + '"]');
    if (radio) radio.checked = true;

    // Coupon apply button
    var applyBtn = document.getElementById('applyCouponBtn');
    var couponInput = document.getElementById('couponCodeInput');
    if (applyBtn && couponInput) {
      applyBtn.addEventListener('click', function() {
        applyCoupon(couponInput.value.trim());
      });

      couponInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          applyCoupon(couponInput.value.trim());
        }
      });
    }

    // Restore coupon UI
    var coupon = getCoupon();
    if (coupon && couponInput) {
      couponInput.value = coupon.code;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      updateCartUI();
      initDeliveryOptions();
    });
  } else {
    updateCartUI();
    initDeliveryOptions();
  }

  // ---- Public API ----

  window.cart = {
    getCart: getCart,
    addToCart: addToCart,
    removeFromCart: removeFromCart,
    updateQty: updateQty,
    clearCart: clearCart,
    getCartTotal: getCartTotal,
    getCartCount: getCartCount,
    getShippingCost: getShippingCost,
    getOrderTotal: getOrderTotal,
    updateCartUI: updateCartUI,
    processCheckout: processCheckout,
    applyCoupon: applyCoupon,
    removeCoupon: removeCoupon
  };

})();
