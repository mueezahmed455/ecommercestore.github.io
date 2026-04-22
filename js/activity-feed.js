(function() {
  'use strict';

  var ActivityFeed = {
    activities: [],
    maxActivities: 20,

    init: function() {
      this.loadActivities();
      this.simulateActivity();
      this.createWidget();
    },

    loadActivities: function() {
      try {
        var saved = localStorage.getItem('dragon_activities');
        this.activities = saved ? JSON.parse(saved) : [];
      } catch(e) {
        this.activities = [];
      }
    },

    saveActivities: function() {
      try {
        localStorage.setItem('dragon_activities', JSON.stringify(this.activities.slice(0, this.maxActivities)));
      } catch(e) {}
    },

    createWidget: function() {
      var widget = document.createElement('div');
      widget.id = 'activityFeedWidget';
      widget.className = 'activity-feed-widget';
      widget.innerHTML =
        '<div class="activity-feed" id="activityFeed"></div>';
      document.body.appendChild(widget);
      this.renderActivities();
    },

    simulateActivity: function() {
      var self = this;
      var names = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jamie', 'Sam'];
      var products = ['Wireless Earbuds Pro', 'Smart Watch Ultra', 'Ultrabook Pro 15"', 'Pro Gaming Headset', 'Wireless Gaming Mouse'];

      setInterval(function() {
        if (Math.random() > 0.7) {
          var name = names[Math.floor(Math.random() * names.length)];
          var product = products[Math.floor(Math.random() * products.length)];
          var location = ['New York', 'London', 'Tokyo', 'Sydney', 'Berlin'][Math.floor(Math.random() * 5)];

          self.addActivity({
            type: 'purchase',
            name: name,
            product: product,
            location: location,
            time: Date.now()
          });
        }
      }, 8000);
    },

    addActivity: function(activity) {
      this.activities.unshift(activity);
      if (this.activities.length > this.maxActivities) {
        this.activities.pop();
      }
      this.saveActivities();
      this.renderActivities();
    },

    renderActivities: function() {
      var feed = document.getElementById('activityFeed');
      if (!feed) return;

      if (!this.activities.length) {
        feed.innerHTML = '';
        return;
      }

      var self = this;
      feed.innerHTML = this.activities.slice(0, 5).map(function(a) {
        var timeAgo = self.getTimeAgo(a.time);
        return '<div class="activity-item">' +
          '<div class="activity-avatar">' + a.name.charAt(0) + '</div>' +
          '<div class="activity-content">' +
            '<strong>' + a.name + '</strong> from ' + a.location + ' just bought ' +
            '<span>' + a.product + '</span>' +
          '</div>' +
          '<div class="activity-time">' + timeAgo + '</div>' +
        '</div>';
      }).join('');

      this.animateIn();
    },

    getTimeAgo: function(timestamp) {
      var seconds = Math.floor((Date.now() - timestamp) / 1000);

      if (seconds < 60) return 'just now';
      if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
      if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
      return Math.floor(seconds / 86400) + 'd ago';
    },

    animateIn: function() {
      var items = document.querySelectorAll('.activity-item');
      items.forEach(function(item, i) {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        setTimeout(function() {
          item.style.transition = 'all 0.3s ease';
          item.style.opacity = '1';
          item.style.transform = 'translateX(0)';
        }, i * 50);
      });
    }
  };

  window.ActivityFeed = ActivityFeed;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { ActivityFeed.init(); });
  } else { ActivityFeed.init(); }

})();