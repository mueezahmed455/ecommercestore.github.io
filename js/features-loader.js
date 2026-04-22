/**
 * Features Loader - Modular loading system for all new features
 * 
 * Usage in index.html:
 * <script src="js/features-loader.js"></script>
 * <script>
 *   window.FEATURES.init({
 *     // Enable/disable features here
 *     arPreview: false,
 *     voiceShop: false,
 *     aiRecommend: true,
 *     // ... etc
 *   });
 * </script>
 */
(function() {
  'use strict';

  var FeaturesLoader = {
    loaded: [],
    config: {},

    files: [
      { name: 'arPreview', file: 'ar-preview.js', enabled: false },
      { name: 'voiceShop', file: 'voice-shop.js', enabled: false },
      { name: 'aiRecommend', file: 'ai-recommend.js', enabled: false },
      { name: 'liveShop', file: 'live-shop.js', enabled: false },
      { name: 'dynamicPricing', file: 'dynamic-pricing.js', enabled: false },
      { name: 'waitlist', file: 'waitlist.js', enabled: false },
      { name: 'videoShowcase', file: 'video-showcase.js', enabled: false },
      { name: 'virtualTryOn', file: 'try-on.js', enabled: false },
      { name: 'bundleBuilder', file: 'bundle-builder.js', enabled: false },
      { name: 'activityFeed', file: 'activity-feed.js', enabled: false },
      { name: 'gamification', file: 'gamification.js', enabled: false },
      { name: 'ecoScore', file: 'eco-score.js', enabled: false },
      { name: 'priceAlerts', file: 'price-alerts.js', enabled: false },
      { name: 'visualSearch', file: 'visual-search.js', enabled: false },
      { name: 'subscription', file: 'subscription.js', enabled: false }
    ],

    init: function(config) {
      this.config = config || {};
      
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
          FeaturesLoader.loadAll();
        });
      } else {
        this.loadAll();
      }
    },

    loadAll: function() {
      var self = this;
      var enabledFeatures = this.files.filter(function(f) {
        return self.config[f.name] !== false;
      });

      enabledFeatures.forEach(function(f, i) {
        var script = document.createElement('script');
        script.src = 'js/' + f.file;
        script.async = false;
        script.onload = function() {
          self.loaded.push(f.name);
          console.log('Loaded: ' + f.name);
        };
        script.onerror = function() {
          console.error('Failed to load: ' + f.file);
        };
        document.head.appendChild(script);
      });
    },

    load: function(featureName) {
      var feature = this.files.find(function(f) {
        return f.name === featureName;
      });

      if (!feature) {
        console.error('Unknown feature: ' + featureName);
        return;
      }

      var script = document.createElement('script');
      script.src = 'js/' + feature.file;
      document.head.appendChild(script);
    },

    isLoaded: function(featureName) {
      return this.loaded.includes(featureName);
    },

    getLoaded: function() {
      return this.loaded;
    },

    getAvailable: function() {
      return this.files.map(function(f) { return f.name; });
    }
  };

  window.FEATURES = FeaturesLoader;

})();