/**
 * Dragon-Sense AI Recommendation Engine
 * Analyzes local behavior (views, cart, purchases) to suggest products.
 * Uses a weighted scoring system based on category affinity.
 */
(function () {
  'use strict';

  function getRecommendations(count) {
    count = count || 4;
    var PRODUCTS = window.PRODUCTS || [];
    var storage = window.storage;
    if (!storage || !PRODUCTS.length) return [];

    var recentlyViewed = storage.getRecentlyViewed() || [];
    var cartItems = storage.getCart().map(function(i) { return i.id; });
    var user = storage.getCurrentUser();
    var orders = user ? storage.getOrders(user.uid) : [];

    // Calculate category affinity
    var affinity = {};
    function boost(cat, weight) {
      if (!cat) return;
      affinity[cat] = (affinity[cat] || 0) + weight;
    }

    // Boost based on views
    recentlyViewed.forEach(function(id) {
      var p = window.getProductById(id);
      if (p) boost(p.category, 1);
    });

    // Boost based on cart
    cartItems.forEach(function(id) {
      var p = window.getProductById(id);
      if (p) boost(p.category, 3);
    });

    // Boost based on past orders
    orders.forEach(function(order) {
      (order.items || []).forEach(function(item) {
        var p = window.getProductById(item.id);
        if (p) boost(p.category, 5);
      });
    });

    // Score all products
    var scored = PRODUCTS.map(function(p) {
      var score = affinity[p.category] || 0;
      // Penalty for items already in cart or recently viewed to keep it fresh
      if (cartItems.indexOf(p.id) !== -1) score -= 10;
      if (recentlyViewed.indexOf(p.id) !== -1) score += 2; // Keep suggesting what they liked
      
      // Randomness factor for discovery
      score += Math.random() * 2;
      
      return { product: p, score: score };
    });

    // Sort and return top N
    return scored
      .sort(function(a, b) { return b.score - a.score; })
      .slice(0, count)
      .map(function(s) { return s.product; });
  }

  function renderRecommendations(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var recs = getRecommendations();
    if (!recs.length) {
      container.style.display = 'none';
      return;
    }

    container.style.display = 'block';
    var grid = container.querySelector('.recs-grid');
    if (!grid) return;

    var html = recs.map(function(p) {
      var price = p.salePrice || p.price;
      var fmt = window.currency ? window.currency.formatPrice(price) : '$' + price.toFixed(2);
      return '<div class="rec-card" data-id="' + p.id + '">' +
        '<div class="rec-img"><img src="' + p.image + '" alt="' + p.name + '"></div>' +
        '<div class="rec-info">' +
          '<div class="rec-name">' + p.name + '</div>' +
          '<div class="rec-price">' + fmt + '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    grid.innerHTML = html;

    grid.querySelectorAll('.rec-card').forEach(function(card) {
      card.addEventListener('click', function() {
        if (window.openProductModal) window.openProductModal(this.dataset.id);
      });
    });
  }

  window.aiRecommend = {
    getRecommendations: getRecommendations,
    renderRecommendations: renderRecommendations
  };

})();
