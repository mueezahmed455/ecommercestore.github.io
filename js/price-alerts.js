(function() {
  'use strict';

  var PriceAlerts = {
    alerts: [],

    init: function() {
      this.loadAlerts();
      this.createWidget();
    },

    loadAlerts: function() {
      try {
        var saved = localStorage.getItem('dragon_price_alerts');
        this.alerts = saved ? JSON.parse(saved) : [];
      } catch(e) {
        this.alerts = [];
      }
    },

    saveAlerts: function() {
      try {
        localStorage.setItem('dragon_price_alerts', JSON.stringify(this.alerts));
      } catch(e) {}
    },

    createWidget: function() {
      var widget = document.createElement('div');
      widget.id = 'priceAlertsWidget';
      widget.className = 'price-alerts-widget';
      widget.innerHTML =
        '<button class="price-alerts-toggle" aria-label="Price Alerts">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
            '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>' +
            '<line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>' +
          '</svg>' +
          '<span class="alerts-badge">' + this.alerts.length + '</span>' +
        '</button>' +
        '<div class="price-alerts-panel">' +
          '<div class="price-alerts-header">' +
            '<h3>Price Drop Alerts</h3>' +
            '<button class="price-alerts-close">&times;</button>' +
          '</div>' +
          '<div class="price-alerts-content" id="priceAlertsContent">' +
            '<p class="alerts-empty">No price alerts set</p>' +
          '</div>' +
        '</div>';
      document.body.appendChild(widget);
      this.bindEvents(widget);
      this.startMonitoring();
    },

    bindEvents: function(widget) {
      var toggle = widget.querySelector('.price-alerts-toggle');
      var panel = widget.querySelector('.price-alerts-panel');
      var close = widget.querySelector('.price-alerts-close');

      if (toggle) toggle.addEventListener('click', function() {
        panel.classList.toggle('open');
        if (panel.classList.contains('open')) {
          PriceAlerts.renderAlerts();
        }
      });

      if (close) close.addEventListener('click', function() {
        panel.classList.remove('open');
      });
    },

    setAlert: function(productId, targetPrice) {
      if (this.isAlertSet(productId)) return false;

      var product = window.getProductById ? window.getProductById(productId) : null;
      if (!product) return false;

      this.alerts.push({
        productId: productId,
        targetPrice: targetPrice,
        originalPrice: product.price,
        setAt: Date.now(),
        notified: false
      });

      this.saveAlerts();
      this.updateBadge();

      if (window.utils) {
        window.utils.showToast('Price alert set for ' + product.name, 'success');
      }

      return true;
    },

    removeAlert: function(productId) {
      var idx = this.alerts.findIndex(function(a) {
        return a.productId === productId;
      });

      if (idx !== -1) {
        this.alerts.splice(idx, 1);
        this.saveAlerts();
        this.updateBadge();
      }
    },

    isAlertSet: function(productId) {
      return this.alerts.some(function(a) {
        return a.productId === productId;
      });
    },

    renderAlerts: function() {
      var content = document.getElementById('priceAlertsContent');
      if (!content) return;

      if (!this.alerts.length) {
        content.innerHTML = '<p class="alerts-empty">No price alerts set</p>';
        return;
      }

      var fmt = window.currency ? window.currency.formatPrice : function(p) { return '$' + p.toFixed(2); };

      content.innerHTML = this.alerts.map(function(alert) {
        var product = window.getProductById ? window.getProductById(alert.productId) : null;
        if (!product) return '';

        var currentPrice = product.salePrice || product.price;
        var targetPrice = alert.targetPrice;
        var dropPercent = targetPrice < currentPrice
          ? Math.round((1 - targetPrice / currentPrice) * 100)
          : 0;

        return '<div class="alert-item" data-id="' + alert.productId + '">' +
          '<div class="alert-item-img">' +
            '<img src="' + product.image + '" alt="' + product.name + '">' +
          '</div>' +
          '<div class="alert-item-info">' +
            '<div class="alert-item-name">' + product.name + '</div>' +
            '<div class="alert-item-prices">' +
              '<span class="current-price">' + fmt(currentPrice) + '</span>' +
              '<span class="target-price">Target: ' + fmt(targetPrice) + '</span>' +
            '</div>' +
            (dropPercent > 0 ? '<span class="alert-drop">-' + dropPercent + '%</span>' : '') +
          '</div>' +
          '<button class="alert-remove" data-id="' + alert.productId + '">&times;</button>' +
        '</div>';
      }).join('');

      var self = this;
      content.querySelectorAll('.alert-remove').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          PriceAlerts.removeAlert(btn.dataset.id);
          PriceAlerts.renderAlerts();
        });
      });
    },

    updateBadge: function() {
      var badge = document.querySelector('.alerts-badge');
      if (badge) badge.textContent = this.alerts.length;
    },

    startMonitoring: function() {
      var self = this;

      setInterval(function() {
        self.checkPrices();
      }, 300000);
    },

    checkPrices: function() {
      var self = this;

      this.alerts.forEach(function(alert) {
        var product = window.getProductById ? window.getProductById(alert.productId) : null;
        if (!product || alert.notified) return;

        var currentPrice = product.salePrice || product.price;

        if (currentPrice <= alert.targetPrice) {
          alert.notified = true;
          self.saveAlerts();

          if (window.utils) {
            window.utils.showToast(product.name + ' dropped to ' + window.currency.formatPrice(currentPrice) + '!', 'success');
          }

          self.renderAlerts();
          self.updateBadge();
        }
      });
    },

    getAlertButton: function(productId) {
      var btn = document.createElement('button');
      btn.className = 'btn btn-outline btn-sm price-alert-btn';
      btn.textContent = this.isAlertSet(productId) ? 'Alert Set' : 'Price Alert';

      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var product = window.getProductById ? window.getProductById(productId) : null;
        if (!product) return;

        var input = prompt('Set target price:', Math.floor(product.price * 0.8));
        if (input) {
          var targetPrice = parseFloat(input);
          if (targetPrice > 0) {
            PriceAlerts.setAlert(productId, targetPrice);
            btn.textContent = 'Alert Set';
          }
        }
      });

      return btn;
    }
  };

  window.PriceAlerts = PriceAlerts;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { PriceAlerts.init(); });
  } else { PriceAlerts.init(); }

})();