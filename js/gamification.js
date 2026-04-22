(function() {
  'use strict';

  var Gamification = {
    userStats: {
      points: 0,
      level: 1,
      badges: [],
      achievements: [],
      totalSpent: 0,
      ordersCount: 0
    },
    levelThresholds: [0, 50, 150, 350, 700, 1200, 2000, 3500, 5000, 10000],
    badges: {
      'first_purchase': { name: 'First Purchase', icon: '🎯', desc: 'Make your first order' },
      'big_spender': { name: 'Big Spender', icon: '💰', desc: 'Spend over $500' },
      'explorer': { name: 'Explorer', icon: '🔍', desc: 'View 20 products' },
      'wishlist_king': { name: 'Wishlist King', icon: '👑', desc: 'Add 5 items to wishlist' },
      'reviewer': { name: 'Reviewer', icon: '⭐', desc: 'Write 3 reviews' },
      'bundle_builder': { name: 'Bundle Builder', icon: '📦', desc: 'Create your first bundle' },
      'early_bird': { name: 'Early Bird', icon: '🌅', desc: 'Shop before 9 AM' },
      'night_owl': { name: 'Night Owl', icon: '🦉', desc: 'Shop after 10 PM' },
      'social_shopper': { name: 'Social Shopper', icon: '📱', desc: 'Share a product' },
      'loyalty': { name: 'Loyal', icon: '💎', desc: 'Make 10 purchases' }
    },

    init: function() {
      this.loadStats();
      this.trackActivity();
      this.createWidget();
    },

    loadStats: function() {
      try {
        var saved = localStorage.getItem('dragon_user_stats');
        if (saved) {
          var parsed = JSON.parse(saved);
          this.userStats = Object.assign(this.userStats, parsed);
        }
      } catch(e) {}
    },

    saveStats: function() {
      try {
        localStorage.setItem('dragon_user_stats', JSON.stringify(this.userStats));
      } catch(e) {}
    },

    createWidget: function() {
      var widget = document.createElement('div');
      widget.id = 'gamificationWidget';
      widget.className = 'gamification-widget';
      widget.innerHTML =
        '<button class="gamification-toggle" aria-label="Rewards">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
            '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>' +
          '</svg>' +
          '<span class="points-badge">' + this.userStats.points + '</span>' +
        '</button>' +
        '<div class="gamification-panel">' +
          '<div class="gamification-header">' +
            '<div class="level-indicator">' +
              '<span class="level-label">Level ' + this.userStats.level + '</span>' +
              '<div class="level-progress">' +
                '<div class="level-bar" style="width:' + this.getProgress() + '%"></div>' +
              '</div>' +
              '<span class="points-label">' + this.userStats.points + ' / ' + this.getNextLevel() + ' pts</span>' +
            '</div>' +
            '<button class="gamification-close">&times;</button>' +
          '</div>' +
          '<div class="gamification-content">' +
            '<div class="badges-section">' +
              '<h4>Badges</h4>' +
              '<div class="badges-grid" id="badgesGrid"></div>' +
            '</div>' +
            '<div class="achievements-section">' +
              '<h4>Achievements</h4>' +
              '<div class="achievements-list" id="achievementsList"></div>' +
            '</div>' +
          '</div>' +
        '</div>';
      document.body.appendChild(widget);
      this.bindEvents(widget);
      this.renderBadges();
    },

    bindEvents: function(widget) {
      var toggle = widget.querySelector('.gamification-toggle');
      var panel = widget.querySelector('.gamification-panel');
      var close = widget.querySelector('.gamification-close');

      if (toggle) toggle.addEventListener('click', function() {
        panel.classList.toggle('open');
      });

      if (close) close.addEventListener('click', function() {
        panel.classList.remove('open');
      });
    },

    getProgress: function() {
      var current = this.levelThresholds[this.userStats.level - 1] || 0;
      var next = this.getNextLevel();
      var points = this.userStats.points - current;
      return Math.min(100, (points / (next - current)) * 100);
    },

    getNextLevel: function() {
      return this.levelThresholds[Math.min(this.userStats.level, this.levelThresholds.length - 1)];
    },

    trackActivity: function() {
      var self = this;

      window.addEventListener('productModalClose', function() {
        self.addPoints(2, 'explorer');
      });

      document.addEventListener('click', function(e) {
        if (e.target.closest('.btn-add-cart')) {
          self.addPoints(10, 'purchase');
        }
      });
    },

    addPoints: function(points, context) {
      this.userStats.points += points;

      while (this.userStats.points >= this.getNextLevel() && this.userStats.level < 10) {
        this.userStats.level++;
        if (window.utils) {
          window.utils.showToast('Level Up! You are now level ' + this.userStats.level, 'success');
        }
      }

      this.checkAchievements(context);
      this.saveStats();
      this.updateUI();
    },

    checkAchievements: function(context) {
      var badges = this.userStats.badges;

      if (this.userStats.ordersCount >= 1 && !badges.includes('first_purchase')) {
        this.unlockBadge('first_purchase');
      }

      if (this.userStats.totalSpent >= 500 && !badges.includes('big_spender')) {
        this.unlockBadge('big_spender');
      }

      var hour = new Date().getHours();
      if (hour < 9 && !badges.includes('early_bird')) {
        this.unlockBadge('early_bird');
      }
      if (hour >= 22 && !badges.includes('night_owl')) {
        this.unlockBadge('night_owl');
      }
    },

    unlockBadge: function(badgeId) {
      if (this.userStats.badges.includes(badgeId)) return;

      this.userStats.badges.push(badgeId);
      this.userStats.points += 50;

      if (window.utils) {
        var badge = this.badges[badgeId];
        window.utils.showToast('🏆 Badge Unlocked: ' + badge.name + '! +50 pts', 'success');
      }

      this.saveStats();
    },

    renderBadges: function() {
      var grid = document.getElementById('badgesGrid');
      if (!grid) return;

      var self = this;
      var unlocked = this.userStats.badges;

      grid.innerHTML = Object.keys(this.badges).map(function(id) {
        var b = self.badges[id];
        var earned = unlocked.includes(id);
        return '<div class="badge-item' + (earned ? '' : ' locked') + '" title="' + b.desc + '">' +
          '<span class="badge-icon">' + b.icon + '</span>' +
          '<span class="badge-name">' + b.name + '</span>' +
        '</div>';
      }).join('');
    },

    updateUI: function() {
      var badge = document.querySelector('.points-badge');
      var levelLabel = document.querySelector('.level-label');
      var levelBar = document.querySelector('.level-bar');

      if (badge) badge.textContent = this.userStats.points;
      if (levelLabel) levelLabel.textContent = 'Level ' + this.userStats.level;
      if (levelBar) levelBar.style.width = this.getProgress() + '%';
    }
  };

  window.Gamification = Gamification;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { Gamification.init(); });
  } else { Gamification.init(); }

})();