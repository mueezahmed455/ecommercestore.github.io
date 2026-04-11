/**
 * Order Confirmation Page Module
 * Reads orderId from URL, fetches order + user data, and renders the confirmation view.
 */
(function() {
  'use strict';

  // ---- Utilities ----

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function formatCurrency(amount) {
    return '$' + (amount || 0).toFixed(2);
  }

  function formatDate(ts) {
    if (!ts) return '\u2014';
    var date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
  }

  /**
   * Calculate estimated delivery date: order date + 10 business days.
   */
  function calcEstimatedDelivery(orderDate) {
    var date = orderDate.toDate ? orderDate.toDate() : new Date(orderDate);
    var businessDays = 0;
    while (businessDays < 10) {
      date.setDate(date.getDate() + 1);
      var day = date.getDay();
      if (day !== 0 && day !== 6) { // skip weekends
        businessDays++;
      }
    }
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  /**
   * Get query parameter by name from the current URL.
   */
  function getQueryParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  var db = window.db;

  // ---- Self-Initialize ----

  initConfirmation();

  /**
   * Main initializer for the confirmation page.
   */
  async function initConfirmation() {
    var orderId = getQueryParam('orderId');

    if (!orderId) {
      showError('No order ID provided. Please check your confirmation link.');
      return;
    }

    await loadOrder(orderId);
  }

  // ---- Loading / Error States ----

  function hideLoading() {
    var loadingEl = document.getElementById('loadingState');
    if (loadingEl) loadingEl.style.display = 'none';
  }

  function showOrderContent() {
    var contentEl = document.getElementById('orderContent');
    if (contentEl) contentEl.style.display = 'block';
  }

  function showError(message) {
    hideLoading();
    var errorState = document.getElementById('errorState');
    if (errorState) {
      errorState.style.display = 'block';
      var errorText = document.getElementById('errorMessage');
      if (errorText) errorText.textContent = message || 'We couldn\'t find the order you\'re looking for.';
    }
  }

  // ---- Load Order ----

  async function loadOrder(orderId) {
    try {
      var fbFirestore = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
      var orderRef = fbFirestore.doc(db.firestore, 'orders', orderId);
      var orderSnap = await fbFirestore.getDoc(orderRef);

      if (!orderSnap.exists()) {
        showError('Order not found. It may have been removed or the link is incorrect.');
        return;
      }

      var order = orderSnap.data();
      order.id = orderSnap.id;

      hideLoading();
      populateOrderDetails(order);

      // Fetch user data in parallel
      if (order.userId) {
        await loadUser(order.userId);
      }

      // Render items
      renderOrderItems(order.items || []);

      // Show the content and animate
      showOrderContent();
      triggerStaggeredReveal();
    } catch (error) {
      console.error('Failed to load order:', error);
      showError('An error occurred while loading your order. Please try again later.');
    }
  }

  // ---- Load User ----

  async function loadUser(userId) {
    try {
      var fbFirestore = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
      var userRef = fbFirestore.doc(db.firestore, 'users', userId);
      var userSnap = await fbFirestore.getDoc(userRef);

      if (userSnap.exists()) {
        var userData = userSnap.data();
        var buyerName = userData.name || 'Customer';
        // Update the thank-you message if a buyer element exists
        var thankYouEl = document.getElementById('buyerName');
        if (thankYouEl) {
          thankYouEl.textContent = escapeHtml(buyerName);
        }
        // Also update header paragraph
        var headerP = document.querySelector('.confirmation-header p');
        if (headerP && userData.name) {
          headerP.textContent = 'Thank you, ' + escapeHtml(userData.name) + '! Your order is being processed.';
        }
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    }
  }

  // ---- Populate Order Details ----

  function populateOrderDetails(order) {
    // Order ID
    var orderIdEl = document.getElementById('orderId');
    if (orderIdEl) orderIdEl.textContent = order.id || '\u2014';

    // Order date
    var orderDateEl = document.getElementById('orderDate');
    if (orderDateEl && order.createdAt) {
      orderDateEl.textContent = formatDate(order.createdAt);
    }

    // Estimated delivery
    var deliveryEl = document.getElementById('estimatedDelivery');
    if (deliveryEl && order.createdAt) {
      deliveryEl.textContent = calcEstimatedDelivery(order.createdAt);
    }

    // Total (top)
    var totalEl = document.getElementById('orderTotal');
    if (totalEl) totalEl.textContent = formatCurrency(order.total);

    // Total (bottom)
    var totalBottomEl = document.getElementById('orderTotalBottom');
    if (totalBottomEl) totalBottomEl.textContent = formatCurrency(order.total);
  }

  // ---- Render Order Items ----

  function renderOrderItems(items) {
    var container = document.getElementById('orderItemsList');
    if (!container) return;

    if (!items.length) {
      container.innerHTML = '<p class="empty-state">No items in this order.</p>';
      return;
    }

    var html = '';
    items.forEach(function(item, index) {
      var itemTotal = formatCurrency((item.price || 0) * (item.quantity || 1));
      var imageSrc = item.image || item.imageUrl || '';
      var imageName = item.name || 'Product';
      var qty = item.quantity || 1;

      html += '<div class="order-item" style="animation-delay: ' + ((index + 1) * 100) + 'ms;">';
      if (imageSrc) {
        html += '<div class="order-item-image">' +
                  '<img src="' + escapeHtml(imageSrc) + '" alt="' + escapeHtml(imageName) + '" loading="lazy">' +
                '</div>';
      } else {
        html += '<div class="order-item-image"></div>';
      }
      html += '<div class="order-item-info">' +
                '<div class="order-item-name">' + escapeHtml(imageName) + '</div>' +
                '<div class="order-item-qty">Qty: ' + qty + '</div>' +
              '</div>' +
              '<div class="order-item-price">' + escapeHtml(itemTotal) + '</div>' +
            '</div>';
    });
    container.innerHTML = html;
  }

  // ---- Staggered Reveal Animation ----

  function triggerStaggeredReveal() {
    // Add 'visible' class to the confirmation card
    var card = document.getElementById('confirmationCard');
    if (card) {
      card.classList.add('visible');
    }

    // Stagger-reveal for order items
    var items = document.querySelectorAll('.order-item');
    items.forEach(function(item, index) {
      setTimeout(function() {
        item.classList.add('reveal', 'visible');
      }, (index + 1) * 100);
    });

    // Stagger-reveal for order details
    var details = document.querySelectorAll('.order-detail-item');
    details.forEach(function(detail, index) {
      setTimeout(function() {
        detail.classList.add('reveal', 'visible');
      }, (index + 1) * 80);
    });
  }

})();
