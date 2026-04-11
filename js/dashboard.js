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
    try {
      var fbAuth = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');

      fbAuth.onAuthStateChanged(window.db.auth, function(user) {
        if (!user) {
          showToast('Please sign in to view your dashboard', 'error');
          window.location.href = 'pages/login.html';
          return;
        }
        loadDashboard(user);
      });
    } catch (error) {
      console.error('Auth check failed:', error);
      window.location.href = 'pages/login.html';
    }
  }

  /**
   * Load all dashboard data
   */
  async function loadDashboard(user) {
    await Promise.all([
      loadUserProfile(user),
      loadUserStats(user),
      loadUserOrders(user),
      loadUserCoupons(user)
    ]);
    setupLogout();
  }

  /**
   * Load user profile info
   */
  async function loadUserProfile(user) {
    try {
      var fbFirestore = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
      var userRef = fbFirestore.doc(window.db.firestore, 'users', user.uid);
      var userSnap = await fbFirestore.getDoc(userRef);

      if (userSnap.exists()) {
        var data = userSnap.data();

        var greeting = document.getElementById('userGreeting');
        if (greeting) greeting.textContent = 'Hi, ' + escapeHtml(data.name || 'User');

        var profileName = document.getElementById('profileName');
        if (profileName) profileName.textContent = escapeHtml(data.name || '\u2014');

        var profileEmail = document.getElementById('profileEmail');
        if (profileEmail) profileEmail.textContent = escapeHtml(data.email || '\u2014');

        var memberSince = document.getElementById('memberSince');
        if (memberSince && data.createdAt) {
          memberSince.textContent = formatDate(data.createdAt);
        }
      } else {
        var greeting = document.getElementById('userGreeting');
        if (greeting) greeting.textContent = 'Hi, ' + escapeHtml(user.displayName || 'User');
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  }

  /**
   * Load user stats
   */
  async function loadUserStats(user) {
    try {
      var fbFirestore = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
      var userRef = fbFirestore.doc(window.db.firestore, 'users', user.uid);
      var userSnap = await fbFirestore.getDoc(userRef);

      if (userSnap.exists()) {
        var data = userSnap.data();
        var totalSpent = data.total_spent || 0;

        var totalEl = document.getElementById('totalSpent');
        if (totalEl) totalEl.textContent = formatCurrency(totalSpent);

        var tier = getRewardsTier(totalSpent);
        var tierEl = document.getElementById('rewardsTier');
        if (tierEl) tierEl.textContent = tier.icon + ' ' + tier.name;
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }

  /**
   * Load user order history
   */
  async function loadUserOrders(user) {
    try {
      var fbFirestore = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
      var ordersRef = fbFirestore.collection(window.db.firestore, 'orders');
      var q = fbFirestore.query(
        ordersRef,
        fbFirestore.where('userId', '==', user.uid),
        fbFirestore.orderBy('createdAt', 'desc'),
        fbFirestore.limit(10)
      );

      var snapshot = await fbFirestore.getDocs(q);
      var orderListEl = document.getElementById('orderHistory');
      var orderCountEl = document.getElementById('orderCount');

      if (snapshot.empty) {
        if (orderListEl) orderListEl.innerHTML = '<p class="empty-state">No orders yet. Start shopping!</p>';
        if (orderCountEl) orderCountEl.textContent = '0';
        return;
      }

      if (orderCountEl) orderCountEl.textContent = snapshot.size;

      if (orderListEl) {
        var html = '';
        snapshot.docs.forEach(function(docSnap) {
          var order = docSnap.data();
          var date = order.createdAt && order.createdAt.toDate ? order.createdAt.toDate() : new Date();
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
    } catch (error) {
      console.error('Failed to load orders:', error);
      var orderListEl = document.getElementById('orderHistory');
      if (orderListEl) orderListEl.innerHTML = '<p class="empty-state">Unable to load orders</p>';
    }
  }

  /**
   * Load user coupons
   */
  async function loadUserCoupons(user) {
    try {
      var fbFirestore = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
      var couponsRef = fbFirestore.collection(window.db.firestore, 'coupons');
      var q = fbFirestore.query(
        couponsRef,
        fbFirestore.where('userId', '==', user.uid),
        fbFirestore.orderBy('createdAt', 'desc')
      );
      var snapshot = await fbFirestore.getDocs(q);

      var couponListEl = document.getElementById('couponList');

      if (snapshot.empty) {
        if (couponListEl) {
          couponListEl.innerHTML = '<p class="empty-state">No coupons yet. Spend over $100 to unlock your first discount!</p>';
        }
        return;
      }

      if (couponListEl) {
        var html = '';
        snapshot.docs.forEach(function(docSnap) {
          var coupon = docSnap.data();
          var expiryStr = coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : 'N/A';

          html += '<div class="coupon-card">' +
            '<div class="coupon-value">' + (coupon.discount || '10') + '% OFF</div>' +
            '<div class="coupon-code">' + escapeHtml(coupon.code || '\u2014') + '</div>' +
            '<div class="coupon-expiry">Expires: ' + expiryStr + '</div>' +
          '</div>';
        });
        couponListEl.innerHTML = html;
      }
    } catch (error) {
      console.error('Failed to load coupons:', error);
    }
  }

  /**
   * Setup logout button
   */
  async function setupLogout() {
    var logoutBtn = document.getElementById('logoutBtn');
    if (!logoutBtn) return;

    logoutBtn.addEventListener('click', async function() {
      try {
        var fbAuth = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
        await fbAuth.signOut(window.db.auth);
        showToast('Signed out successfully', 'success');
        window.location.href = '../index.html';
      } catch (error) {
        console.error('Logout failed:', error);
        showToast('Failed to sign out', 'error');
      }
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
