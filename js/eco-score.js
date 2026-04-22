(function() {
  'use strict';

  var EcoScore = {
    productScores: {},

    init: function() {
      this.loadScores();
      this.createWidget();
    },

    loadScores: function() {
      if (!window.PRODUCTS) return;

      this.productScores = {
        'prod_001': { score: 85, rating: 'A', features: ['Recyclable packaging', 'Long battery life'] },
        'prod_002': { score: 75, rating: 'B', features: ['Energy efficient', 'Recyclable materials'] },
        'prod_003': { score: 70, rating: 'B', features: ['Durable construction'] },
        'prod_004': { score: 80, rating: 'A', features: ['Low power consumption'] },
        'prod_005': { score: 90, rating: 'A+', features: ['Solar charging option', 'Recycled titanium'] },
        'prod_006': { score: 78, rating: 'B+', features: ['Long battery lifespan'] },
        'prod_007': { score: 88, rating: 'A', features: ['Energy Star certified', 'Recyclable aluminum'] },
        'prod_008': { score: 72, rating: 'B', features: ['LED backlight', 'Energy saving mode'] },
        'prod_009': { score: 82, rating: 'A', features: ['Recyclable materials', 'Low power OLED'] },
        'prod_010': { score: 85, rating: 'A', features: ['Hot-swappable switches', 'Recyclable case'] },
        'prod_011': { score: 80, rating: 'A', features: ['Long battery life', 'Efficient sensor'] },
        'prod_012': { score: 65, rating: 'C', features: ['High capacity'] },
        'prod_013': { score: 78, rating: 'B+', features: ['Energy efficient'] },
        'prod_014': { score: 70, rating: 'B', features: ['Multi-port efficiency'] },
        'prod_015': { score: 88, rating: 'A', features: ['Low power NVMe', 'Recyclable aluminum'] },
        'prod_016': { score: 60, rating: 'C', features: ['High power consumption'] }
      };
    },

    createWidget: function() {
      var section = document.createElement('section');
      section.id = 'ecoScoreSection';
      section.className = 'eco-score-section';
      section.innerHTML =
        '<div class="container">' +
          '<div class="section-header">' +
            '<p class="section-eyebrow">Sustainability</p>' +
            '<h2 class="section-title">Eco-Friendly Products</h2>' +
            '<p class="section-sub">Shop with a clear conscience</p>' +
          '</div>' +
          '<div class="eco-filters">' +
            '<button class="eco-filter active" data-rating="all">All</button>' +
            '<button class="eco-filter" data-rating="A+">A+ Rating</button>' +
            '<button class="eco-filter" data-rating="A">A Rating</button>' +
            '<button class="eco-filter" data-rating="B">B+ or below</button>' +
          '</div>' +
          '<div class="eco-products-grid" id="ecoProductsGrid"></div>' +
        '</div>';
      document.body.appendChild(section);
      this.bindEvents(section);
      this.renderProducts();
    },

    bindEvents: function(section) {
      var filters = section.querySelectorAll('.eco-filter');
      var self = this;

      filters.forEach(function(filter) {
        filter.addEventListener('click', function() {
          filters.forEach(function(f) { f.classList.remove('active'); });
          filter.classList.add('active');
          self.renderProducts(filter.dataset.rating);
        });
      });
    },

    renderProducts: function(ratingFilter) {
      var grid = document.getElementById('ecoProductsGrid');
      if (!grid || !window.PRODUCTS) return;

      var products = window.PRODUCTS.filter(function(p) {
        if (!ratingFilter || ratingFilter === 'all') return true;
        var score = EcoScore.productScores[p.id];
        if (!score) return true;

        if (ratingFilter === 'A+') return score.rating === 'A+';
        if (ratingFilter === 'A') return score.rating === 'A' || score.rating === 'A+';
        if (ratingFilter === 'B') return score.rating === 'B' || score.rating === 'B+' || score.rating === 'C';
        return true;
      });

      var fmt = window.currency ? window.currency.formatPrice : function(p) { return '$' + p.toFixed(2); };

      grid.innerHTML = products.map(function(p) {
        var score = EcoScore.productScores[p.id] || { score: 50, rating: 'C', features: [] };
        return '<div class="eco-product-card" data-id="' + p.id + '">' +
          '<div class="eco-score-badge eco-' + score.rating.replace('+', '').toLowerCase() + '">' +
            '<span class="eco-rating">' + score.rating + '</span>' +
            '<span class="eco-label">Eco</span>' +
          '</div>' +
          '<div class="eco-product-img"><img src="' + p.image + '" alt="' + p.name + '"></div>' +
          '<div class="eco-product-name">' + p.name + '</div>' +
          '<div class="eco-features">' +
            score.features.map(function(f) { return '<span class="eco-feature">' + f + '</span>'; }).join('') +
          '</div>' +
          '<div class="eco-product-price">' + fmt(p.salePrice || p.price) + '</div>' +
        '</div>';
      }).join('');

      grid.querySelectorAll('.eco-product-card').forEach(function(card) {
        card.addEventListener('click', function() {
          if (window.openProductModal) window.openProductModal(card.dataset.id);
        });
      });
    },

    getScore: function(productId) {
      return this.productScores[productId] || null;
    },

    renderBadge: function(productId) {
      var score = this.getScore(productId);
      if (!score) return '';

      var badge = document.createElement('div');
      badge.className = 'eco-score-badge-small eco-' + score.rating.replace('+', '').toLowerCase();
      badge.innerHTML =
        '<span class="eco-rating-small">' + score.rating + '</span>' +
        '<span class="eco-label-small">Eco</span>';
      return badge;
    }
  };

  window.EcoScore = EcoScore;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { EcoScore.init(); });
  } else { EcoScore.init(); }

})();