/**
 * Dashboard Module
 * CRM functionality: user stats, orders, coupons, profile
 */
(function() {
  'use strict';

  // ---- Self-contained utilities ----

  

  

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  

  function formatDate(ts) {
    if (!ts) return '\u2014';
    var date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function getRewardsTier(totalSpent) {
    if (totalSpent >= 500) return { name: 'Platinum', icon: '\uD83D\uDC8E' };
    if (totalSpent >= 250) return { name: 'Gold', icon: '\uD83E\uDD47' };
    if (totalSpent >= 100) return { name: 'Silver', icon: '\uD83E\uDD48' };
    return { name: 'Bronze', icon: '\uD83E\uDD49' };
  }

  // ---- Initialize ----

  initDashboard();
  initStatCardGlow();
  initScrollReveal();

  /**
   * Initialize Dashboard - check auth
   */
  async function initDashboard() {
    const user = window.storage.getCurrentUser();
    if (!user) {
      showToast('Please sign in to view your dashboard', 'error');
      window.location.href = 'login.html';
      return;
    }
    loadDashboard(user);
  }

  /**
   * Load all dashboard data
   */
  async function loadDashboard(user) {
    loadUserProfile(user);
    loadUserStats(user);
    loadUserOrders(user);
    loadUserCoupons(user);
    setupLogout();
  }

  /**
   * Load user profile info
   */
  function loadUserProfile(user) {
    var greeting = document.getElementById('userGreeting');
    if (greeting) greeting.textContent = 'Hi, ' + escapeHtml(user.name || 'User');

    var profileName = document.getElementById('profileName');
    if (profileName) profileName.textContent = escapeHtml(user.name || '\u2014');

    var profileEmail = document.getElementById('profileEmail');
    if (profileEmail) profileEmail.textContent = escapeHtml(user.email || '\u2014');

    var memberSince = document.getElementById('memberSince');
    if (memberSince && user.createdAt) {
      memberSince.textContent = formatDate(user.createdAt);
    }
  }

  /**
   * Load user stats
   */
  function loadUserStats(user) {
    var orders = window.storage.getOrders(user.uid);
    var totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);

    var totalEl = document.getElementById('totalSpent');
    if (totalEl) totalEl.textContent = formatCurrency(totalSpent);

    var orderCountEl = document.getElementById('orderCount');
    if (orderCountEl) orderCountEl.textContent = orders.length;

    var tier = getRewardsTier(totalSpent);
    var tierEl = document.getElementById('rewardsTier');
    if (tierEl) tierEl.textContent = tier.icon + ' ' + tier.name;

    // Update Dragon Evolution
    updateDragonEvolution(totalSpent);
  }

  function updateDragonEvolution(totalSpent) {
    var bar = document.getElementById('dragonProgressBar');
    var badge = document.getElementById('dragonTierBadge');
    var hint = document.getElementById('dragonProgressHint');
    
    if (!bar || !badge) return;

    if (totalSpent >= 500) {
      bar.style.width = '100%';
      badge.textContent = 'Great Wyrm';
      hint.textContent = 'You have reached the ultimate evolution!';
    } else if (totalSpent >= 250) {
      bar.style.width = '75%';
      badge.textContent = 'Drake';
      hint.textContent = '$' + (500 - totalSpent).toFixed(2) + ' until Great Wyrm status!';
    } else if (totalSpent >= 100) {
      bar.style.width = '50%';
      badge.textContent = 'Wyrmling';
      hint.textContent = '$' + (250 - totalSpent).toFixed(2) + ' until Drake status!';
    } else {
      bar.style.width = '25%';
      badge.textContent = 'Egg';
      hint.textContent = '$' + (100 - totalSpent).toFixed(2) + ' until Wyrmling hatches!';
    }
  }

  /**
   * Load user order history
   */
  function loadUserOrders(user) {
    var orders = window.storage.getOrders(user.uid);
    var orderListEl = document.getElementById('orderHistory');

    if (orders.length === 0) {
      if (orderListEl) orderListEl.innerHTML = '<p class="empty-state">No orders yet. Start shopping!</p>';
      return;
    }

    if (orderListEl) {
      var html = '';
      orders.slice().reverse().forEach(function(order) {
        var date = new Date(order.createdAt);
        var dateStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

        html += '<div class="order-item">' +
          '<div>' +
            '<div class="order-date">' + dateStr + '</div>' +
            '<div class="order-status ' + (order.status || 'completed') + '">' + capitalize(order.status || 'completed') + '</div>' +
          '</div>' +
          '<div class="order-total">' + formatCurrency(order.total || 0) + '</div>' +
        '</div>';
      });
      orderListEl.innerHTML = html;
    }
  }

  /**
   * Load user coupons
   */
  function loadUserCoupons(user) {
    // Simulated coupons for now
    var couponListEl = document.getElementById('couponList');
    if (couponListEl) {
      couponListEl.innerHTML = '<p class="empty-state">No coupons yet. Spend over $100 to unlock your first discount!</p>';
    }
  }

  /**
   * Setup logout button
   */
  function setupLogout() {
    var logoutBtn = document.getElementById('logoutBtn');
    if (!logoutBtn) return;

    logoutBtn.addEventListener('click', function() {
      window.storage.logout();
      showToast('Signed out successfully', 'success');
      setTimeout(() => { window.location.href = '../index.html'; }, 800);
    });
  }

  /**
   * Stat card mouse-tracking glow effect
   */
  function initStatCardGlow() {
    var cards = document.querySelectorAll('.stat-card');
    cards.forEach(function(card) {
      card.addEventListener('mousemove', function(e) {
        var rect = card.getBoundingClientRect();
        var x = ((e.clientX - rect.left) / rect.width) * 100;
        var y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mouse-x', x + '%');
        card.style.setProperty('--mouse-y', y + '%');
      });
    });
  }

  /**
   * Scroll reveal via IntersectionObserver
   */
  function initScrollReveal() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach(function(el) {
        el.classList.add('visible');
      });
      return;
    }

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -30px 0px'
    });

    document.querySelectorAll('.reveal').forEach(function(el) {
      observer.observe(el);
    });
  }

})();
