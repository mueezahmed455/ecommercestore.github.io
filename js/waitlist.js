(function() {
  'use strict';

  var Waitlist = {
    waitlistItems: [],

    init: function() {
      this.loadWaitlist();
      this.createWidget();
    },

    loadWaitlist: function() {
      try {
        var saved = localStorage.getItem('dragon_waitlist');
        this.waitlistItems = saved ? JSON.parse(saved) : [];
      } catch(e) {
        this.waitlistItems = [];
      }
    },

    saveWaitlist: function() {
      try {
        localStorage.setItem('dragon_waitlist', JSON.stringify(this.waitlistItems));
      } catch(e) {}
    },

    createWidget: function() {
      var widget = document.createElement('div');
      widget.id = 'waitlistWidget';
      widget.className = 'waitlist-widget';
      widget.innerHTML =
        '<button class="waitlist-toggle" aria-label="Waitlist">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
            '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>' +
            '<path d="M13.73 21a2 2 0 0 1-3.46 0"/>' +
          '</svg>' +
          '<span class="waitlist-badge">0</span>' +
        '</button>' +
        '<div class="waitlist-panel">' +
          '<div class="waitlist-header">' +
            '<h3>Waitlist Alerts</h3>' +
            '<button class="waitlist-close">&times;</button>' +
          '</div>' +
          '<div class="waitlist-content" id="waitlistContent">' +
            '<p class="waitlist-empty">No items in waitlist</p>' +
          '</div>' +
        '</div>';
      document.body.appendChild(widget);
      this.bindEvents(widget);
      this.updateBadge();
    },

    bindEvents: function(widget) {
      var toggle = widget.querySelector('.waitlist-toggle');
      var panel = widget.querySelector('.waitlist-panel');
      var close = widget.querySelector('.waitlist-close');

      if (toggle) toggle.addEventListener('click', function() {
        panel.classList.toggle('open');
        if (panel.classList.contains('open')) {
          Waitlist.renderWaitlist();
        }
      });

      if (close) close.addEventListener('click', function() {
        panel.classList.remove('open');
      });
    },

    renderWaitlist: function() {
      var content = document.getElementById('waitlistContent');
      if (!content) return;

      if (!this.waitlistItems.length) {
        content.innerHTML = '<p class="waitlist-empty">No items in waitlist</p>';
        return;
      }

      var self = this;
      content.innerHTML = this.waitlistItems.map(function(item) {
        var product = window.getProductById ? window.getProductById(item.productId) : null;
        return '<div class="waitlist-item" data-id="' + item.productId + '">' +
          '<div class="waitlist-item-img">' +
            (product ? '<img src="' + product.image + '" alt="' + product.name + '">' : '') +
          '</div>' +
          '<div class="waitlist-item-info">' +
            '<div class="waitlist-item-name">' + (product ? product.name : item.productId) + '</div>' +
            '<div class="waitlist-status">' +
              (item.inStock ? '<span class="status-available">In Stock!</span>' :
                '<span class="status notified">Notifying you...</span>') +
            '</div>' +
          '</div>' +
          '<button class="waitlist-remove" data-id="' + item.productId + '">&times;</button>' +
        '</div>';
      }).join('');

      content.querySelectorAll('.waitlist-remove').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var id = btn.dataset.id;
          Waitlist.removeFromWaitlist(id);
          Waitlist.renderWaitlist();
        });
      });
    },

    addToWaitlist: function(productId) {
      if (this.isInWaitlist(productId)) return false;

      this.waitlistItems.push({
        productId: productId,
        addedAt: Date.now(),
        inStock: false,
        notifyEmail: null
      });

      this.saveWaitlist();
      this.updateBadge();

      if (window.utils) {
        window.utils.showToast('Added to waitlist — we\'ll notify you!', 'success');
      }

      return true;
    },

    removeFromWaitlist: function(productId) {
      var idx = this.waitlistItems.findIndex(function(item) {
        return item.productId === productId;
      });

      if (idx !== -1) {
        this.waitlistItems.splice(idx, 1);
        this.saveWaitlist();
        this.updateBadge();
      }
    },

    isInWaitlist: function(productId) {
      return this.waitlistItems.some(function(item) {
        return item.productId === productId;
      });
    },

    updateBadge: function() {
      var badge = document.querySelector('.waitlist-badge');
      if (badge) badge.textContent = this.waitlistItems.length;
    },

    notifyAvailable: function(productId) {
      var item = this.waitlistItems.find(function(i) {
        return i.productId === productId;
      });

      if (item && !item.inStock) {
        item.inStock = true;
        this.saveWaitlist();

        if (window.utils) {
          window.utils.showToast(window.getProductById(productId).name + ' is back in stock!', 'success');
        }

        this.renderWaitlist();
        this.updateBadge();
      }
    },

    loadFromProduct: function(product) {
      var btn = document.createElement('button');
      btn.className = 'btn btn-outline btn-sm waitlist-btn';
      btn.dataset.id = product.id;
      btn.textContent = this.isInWaitlist(product.id) ? 'On Waitlist' : 'Join Waitlist';

      btn.addEventListener('click', function() {
        if (Waitlist.isInWaitlist(product.id)) {
          Waitlist.removeFromWaitlist(product.id);
          btn.textContent = 'Join Waitlist';
        } else {
          Waitlist.addToWaitlist(product.id);
          btn.textContent = 'On Waitlist';
        }
      });

      return btn;
    }
  };

  window.Waitlist = Waitlist;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { Waitlist.init(); });
  } else { Waitlist.init(); }

})();