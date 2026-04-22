(function() {
  'use strict';

  var DynamicPricing = {
    basePrices: {},
    demandFactors: {},
    userFactors: {},
    timeFactor: 1.0,

    init: function() {
      this.loadFactors();
      this.trackUserBehavior();
      this.updatePricingLoop();
    },

    loadFactors: function() {
      if (!window.PRODUCTS) return;

      window.PRODUCTS.forEach(function(p) {
        this.basePrices[p.id] = p.price;
        this.demandFactors[p.id] = 1.0;
      }.bind(this));

      try {
        var saved = localStorage.getItem('dragon_dynamic_pricing');
        if (saved) this.demandFactors = JSON.parse(saved);
      } catch(e) {}
    },

    trackUserBehavior: function() {
      var viewed = localStorage.getItem('dragon_recently_viewed');
      if (!viewed) return;

      try {
        var ids = JSON.parse(viewed);
        ids.forEach(function(id) {
          if (this.demandFactors[id]) {
            this.demandFactors[id] = Math.min(1.15, this.demandFactors[id] + 0.02);
          }
        }.bind(this));
      } catch(e) {}
    },

    updatePricingLoop: function() {
      var self = this;
      setInterval(function() {
        self.updateTimeFactor();
        self.saveFactors();
      }, 60000);
    },

    updateTimeFactor: function() {
      var hour = new Date().getHours();

      if (hour >= 18 && hour <= 21) {
        this.timeFactor = 0.95;
      } else if (hour >= 12 && hour <= 14) {
        this.timeFactor = 0.97;
      } else if (hour >= 9 && hour <= 11) {
        this.timeFactor = 1.02;
      } else {
        this.timeFactor = 1.0;
      }
    },

    getPrice: function(productId) {
      var base = this.basePrices[productId];
      if (!base) return null;

      var demand = this.demandFactors[productId] || 1.0;
      var user = this.getUserFactor();
      var time = this.timeFactor;

      var multiplier = demand * user * time;
      return +(base * multiplier).toFixed(2);
    },

    getUserFactor: function() {
      var purchases = localStorage.getItem('dragon_purchase_history');
      var count = 0;
      try {
        count = purchases ? JSON.parse(purchases).length : 0;
      } catch(e) {}

      return count > 5 ? 0.92 : count > 2 ? 0.95 : 1.0;
    },

    getDiscount: function(productId) {
      var current = this.getPrice(productId);
      var base = this.basePrices[productId];
      if (!current || !base) return 0;

      return Math.round((1 - current / base) * 100);
    },

    applyDynamicPrices: function() {
      if (!window.PRODUCTS) return;

      document.querySelectorAll('[data-price-usd]').forEach(function(el) {
        var id = el.closest('[data-id]');
        if (id) {
          var productId = id.dataset.id;
          var dynamicPrice = this.getPrice(productId);
          if (dynamicPrice) {
            el.textContent = window.currency
              ? window.currency.formatPrice(dynamicPrice)
              : '$' + dynamicPrice.toFixed(2);
          }
        }
      }.bind(this));
    },

    saveFactors: function() {
      try {
        localStorage.setItem('dragon_dynamic_pricing', JSON.stringify(this.demandFactors));
      } catch(e) {}
    },

    getSavings: function(productId) {
      var base = this.basePrices[productId];
      var current = this.getPrice(productId);
      if (!base || !current) return 0;
      return base - current;
    }
  };

  window.DynamicPricing = DynamicPricing;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { DynamicPricing.init(); });
  } else { DynamicPricing.init(); }

})();