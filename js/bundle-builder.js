(function() {
  'use strict';

  var BundleBuilder = {
    bundleItems: [],
    bundleDiscount: 0.1,
    maxItems: 5,

    init: function() {
      this.loadBundle();
      this.createWidget();
    },

    loadBundle: function() {
      try {
        var saved = localStorage.getItem('dragon_custom_bundle');
        this.bundleItems = saved ? JSON.parse(saved) : [];
      } catch(e) {
        this.bundleItems = [];
      }
    },

    saveBundle: function() {
      try {
        localStorage.setItem('dragon_custom_bundle', JSON.stringify(this.bundleItems));
      } catch(e) {}
    },

    createWidget: function() {
      var widget = document.createElement('div');
      widget.id = 'bundleBuilderWidget';
      widget.className = 'bundle-builder-widget';
      widget.innerHTML =
        '<button class="bundle-builder-toggle" aria-label="Custom Bundle Builder">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
            '<rect x="3" y="3" width="7" height="7"/>' +
            '<rect x="14" y="3" width="7" height="7"/>' +
            '<rect x="14" y="14" width="7" height="7"/>' +
            '<rect x="3" y="14" width="7" height="7"/>' +
          '</svg>' +
          '<span>Build Bundle</span>' +
        '</button>' +
        '<div class="bundle-builder-panel">' +
          '<div class="bundle-builder-header">' +
            '<h3>Custom Bundle</h3>' +
            '<span class="bundle-discount">Save 10%</span>' +
            '<button class="bundle-builder-close">&times;</button>' +
          '</div>' +
          '<div class="bundle-builder-content">' +
            '<p class="bundle-empty">Add products to build your bundle</p>' +
            '<div class="bundle-items" id="bundleItems"></div>' +
            '<div class="bundle-summary" id="bundleSummary" style="display:none;">' +
              '<div class="bundle-total">' +
                '<span>Total:</span>' +
                '<span id="bundleTotalPrice">$0.00</span>' +
              '</div>' +
              '<div class="bundle-savings">' +
                '<span>You save:</span>' +
                '<span id="bundleSavings">$0.00</span>' +
              '</div>' +
              '<button class="btn btn-primary btn-block" id="addBundleToCart">Add Bundle to Cart</button>' +
              '<button class="btn btn-outline btn-sm" id="clearBundle">Clear Bundle</button>' +
            '</div>' +
          '</div>' +
        '</div>';
      document.body.appendChild(widget);
      this.bindEvents(widget);
      this.renderBundle();
    },

    bindEvents: function(widget) {
      var toggle = widget.querySelector('.bundle-builder-toggle');
      var panel = widget.querySelector('.bundle-builder-panel');
      var close = widget.querySelector('.bundle-builder-close');
      var addBtn = widget.querySelector('#addBundleToCart');
      var clearBtn = widget.querySelector('#clearBundle');

      if (toggle) toggle.addEventListener('click', function() {
        panel.classList.toggle('open');
      });

      if (close) close.addEventListener('click', function() {
        panel.classList.remove('open');
      });

      if (addBtn) addBtn.addEventListener('click', function() {
        BundleBuilder.addBundleToCart();
      });

      if (clearBtn) clearBtn.addEventListener('click', function() {
        BundleBuilder.clearBundle();
      });
    },

    addProduct: function(productId) {
      if (this.bundleItems.length >= this.maxItems) {
        if (window.utils) {
          window.utils.showToast('Max ' + this.maxItems + ' items per bundle', 'error');
        }
        return false;
      }

      if (this.bundleItems.some(function(id) { return id === productId; })) {
        return false;
      }

      this.bundleItems.push(productId);
      this.saveBundle();
      this.renderBundle();

      if (window.utils) {
        window.utils.showToast('Added to bundle', 'success');
      }

      return true;
    },

    removeProduct: function(productId) {
      var idx = this.bundleItems.indexOf(productId);
      if (idx !== -1) {
        this.bundleItems.splice(idx, 1);
        this.saveBundle();
        this.renderBundle();
      }
    },

    renderBundle: function() {
      var container = document.getElementById('bundleItems');
      var summary = document.getElementById('bundleSummary');
      if (!container) return;

      var empty = container.parentElement.querySelector('.bundle-empty');

      if (!this.bundleItems.length) {
        container.innerHTML = '';
        if (empty) empty.style.display = '';
        if (summary) summary.style.display = 'none';
        return;
      }

      if (empty) empty.style.display = 'none';

      var fmt = window.currency ? window.currency.formatPrice : function(p) { return '$' + p.toFixed(2); };

      container.innerHTML = this.bundleItems.map(function(id) {
        var p = window.getProductById ? window.getProductById(id) : null;
        if (!p) return '';
        return '<div class="bundle-item" data-id="' + id + '">' +
          '<img src="' + p.image + '" alt="' + p.name + '">' +
          '<div class="bundle-item-info">' +
            '<div class="bundle-item-name">' + p.name + '</div>' +
            '<div class="bundle-item-price">' + fmt(p.price) + '</div>' +
          '</div>' +
          '<button class="bundle-item-remove" data-id="' + id + '">&times;</button>' +
        '</div>';
      }).join('');

      container.querySelectorAll('.bundle-item-remove').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          BundleBuilder.removeProduct(btn.dataset.id);
        });
      });

      if (summary) summary.style.display = '';
      this.updateSummary();
    },

    updateSummary: function() {
      var total = this.bundleItems.reduce(function(sum, id) {
        var p = window.getProductById ? window.getProductById(id) : null;
        return sum + (p ? p.price : 0);
      }, 0);

      var savings = total * this.bundleDiscount;
      var finalTotal = total - savings;

      var totalEl = document.getElementById('bundleTotalPrice');
      var savingsEl = document.getElementById('bundleSavings');
      var fmt = window.currency ? window.currency.formatPrice : function(p) { return '$' + p.toFixed(2); };

      if (totalEl) totalEl.textContent = fmt(finalTotal);
      if (savingsEl) savingsEl.textContent = fmt(savings);
    },

    addBundleToCart: function() {
      var self = this;
      this.bundleItems.forEach(function(id) {
        if (window.cart && window.cart.addToCart) {
          window.cart.addToCart(id);
        }
      });

      if (window.utils) {
        window.utils.showToast('Bundle added to cart! You saved 10%!', 'success');
      }

      setTimeout(function() {
        self.clearBundle();
        document.querySelector('.bundle-builder-panel').classList.remove('open');
      }, 500);
    },

    clearBundle: function() {
      this.bundleItems = [];
      this.saveBundle();
      this.renderBundle();
    },

    getBundleButton: function(productId) {
      var btn = document.createElement('button');
      btn.className = 'btn btn-outline btn-sm bundle-add-btn';
      btn.textContent = 'Add to Bundle';
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        BundleBuilder.addProduct(productId);
      });
      return btn;
    }
  };

  window.BundleBuilder = BundleBuilder;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { BundleBuilder.init(); });
  } else { BundleBuilder.init(); }

})();