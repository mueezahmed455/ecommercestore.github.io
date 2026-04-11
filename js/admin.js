/**
 * Admin Panel Module
 * Full admin dashboard: users, orders, coupons, announcement, transactions.
 * Auth-guarded: redirects non-admin users to index.html.
 */
(function() {
  'use strict';

  // ---- Utilities ----

  

  

  function capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
  }

  

  function formatDate(ts) {
    if (!ts) return '\u2014';
    var date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function formatDateTime(ts) {
    if (!ts) return '\u2014';
    var date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  var db = window.db;

  // ---- Auth Guard ----

  initAdminGuard();

  /**
   * Check that the current user has role === 'admin' in Firestore.
   * Redirects to index.html if not.
   */
  async function initAdminGuard() {
    try {
      var fbAuth = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
      fbAuth.onAuthStateChanged(db.auth, async function(user) {
        if (!user) {
          window.location.href = 'pages/login.html';
          return;
        }
        try {
          var fbFirestore = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
          var userRef = fbFirestore.doc(db.firestore, 'users', user.uid);
          var userSnap = await fbFirestore.getDoc(userRef);
          if (userSnap.exists()) {
            var data = userSnap.data();
            if (data.role !== 'admin') {
              showToast('Access denied. Admin privileges required.', 'error');
              window.location.href = '../index.html';
              return;
            }
          }
          // Self-initialize only when admin DOM elements are present
          if (document.getElementById('adminUsersTable') ||
              document.getElementById('usersTableBody') ||
              document.querySelector('#usersPanel')) {
            initAdminPanel();
          }
        } catch (err) {
          console.error('Admin guard error:', err);
          showToast('Failed to verify admin role', 'error');
          window.location.href = '../index.html';
        }
      });
    } catch (error) {
      console.error('Auth guard failed:', error);
      window.location.href = 'pages/login.html';
    }
  }

  // ---- Main Initializer ----

  var allUsers = [];
  var allOrders = [];
  var allCoupons = [];
  var orderStatusFilter = 'all';
  var sortStates = {};

  /**
   * Initialize the admin panel
   */
  async function initAdminPanel() {
    initTabSwitching();
    initTableSorting();
    initStatusFilter();
    initSearchFilters();
    initAnnouncementEditor();
    initTransactionLog();
    setupLogout();
    setupScrollReveal();

    await Promise.all([
      loadStats(),
      loadUsers(),
      loadOrders(),
      loadCoupons()
    ]);
  }

  // ---- Tab Switching ----

  function initTabSwitching() {
    var tabButtons = document.querySelectorAll('.tab-btn[data-tab]');
    tabButtons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var tabId = this.getAttribute('data-tab');
        if (!tabId) return;

        // Deactivate all tabs
        tabButtons.forEach(function(b) {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        // Activate clicked tab
        this.classList.add('active');
        this.setAttribute('aria-selected', 'true');

        // Hide all panels, show the target
        var panels = document.querySelectorAll('.admin-panel');
        panels.forEach(function(panel) {
          panel.setAttribute('hidden', '');
        });
        var targetPanel = document.getElementById(tabId + 'Panel');
        if (targetPanel) {
          targetPanel.removeAttribute('hidden');
        }
      });
    });
  }

  // ---- Table Sorting ----

  function initTableSorting() {
    var sortableHeaders = document.querySelectorAll('.data-table th.sortable');
    sortableHeaders.forEach(function(th) {
      th.addEventListener('click', function() {
        var table = this.closest('table');
        if (!table) return;
        var tableId = table.id;
        var sortKey = this.getAttribute('data-sort');
        if (!sortKey) return;

        var tbodyId = tableId.replace('Table', 'TableBody');
        var tbody = document.getElementById(tbodyId);
        if (!tbody) return;

        // Toggle sort direction
        if (!sortStates[tableId]) sortStates[tableId] = {};
        var currentDir = sortStates[tableId][sortKey] || 'asc';
        var newDir = currentDir === 'asc' ? 'desc' : 'asc';
        sortStates[tableId][sortKey] = newDir;

        // Update sort icons
        table.querySelectorAll('.sort-icon').forEach(function(icon) {
          icon.innerHTML = '<polyline points="7 15 12 20 17 15" opacity="0.3"/><polyline points="7 4 12 9 17 4" opacity="0.3"/>';
        });
        var activeIcon = this.querySelector('.sort-icon');
        if (activeIcon) {
          if (newDir === 'asc') {
            activeIcon.innerHTML = '<polyline points="7 15 12 20 17 15"/><polyline points="7 4 12 9 17 4" opacity="0.3"/>';
          } else {
            activeIcon.innerHTML = '<polyline points="7 15 12 20 17 15" opacity="0.3"/><polyline points="7 4 12 9 17 4"/>';
          }
        }

        // Sort data and re-render
        sortTableData(tableId, sortKey, newDir);
        renderTableData(tableId, tbody);
      });
    });
  }

  function sortTableData(tableId, sortKey, direction) {
    var data;
    if (tableId === 'usersTable') data = allUsers;
    else if (tableId === 'ordersTable') data = allOrders;
    else if (tableId === 'couponsTable') data = allCoupons;
    else return;

    data.sort(function(a, b) {
      var valA = getSortValue(a, sortKey);
      var valB = getSortValue(b, sortKey);
      if (typeof valA === 'number' && typeof valB === 'number') {
        return direction === 'asc' ? valA - valB : valB - valA;
      }
      valA = String(valA).toLowerCase();
      valB = String(valB).toLowerCase();
      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  function getSortValue(item, key) {
    switch (key) {
      case 'id': return item.id || '';
      case 'name': return (item.name || '').toLowerCase();
      case 'email': return (item.email || '').toLowerCase();
      case 'total_spent': return item.total_spent || 0;
      case 'role': return item.role || '';
      case 'createdAt': return item.createdAt ? (item.createdAt.toDate ? item.createdAt.toDate().getTime() : new Date(item.createdAt).getTime()) : 0;
      case 'user': return (item.userName || item.userId || '').toLowerCase();
      case 'total': return item.total || 0;
      case 'status': return item.status || '';
      case 'date': return item.createdAt ? (item.createdAt.toDate ? item.createdAt.toDate().getTime() : new Date(item.createdAt).getTime()) : 0;
      case 'code': return (item.code || '').toLowerCase();
      case 'discount': return item.discount || 0;
      case 'expiresAt': return item.expiresAt ? (item.expiresAt.toDate ? item.expiresAt.toDate().getTime() : new Date(item.expiresAt).getTime()) : 0;
      case 'used': return item.used ? 1 : 0;
      default: return '';
    }
  }

  function renderTableData(tableId, tbody) {
    if (tableId === 'usersTable') renderUsersTable(tbody);
    else if (tableId === 'ordersTable') renderOrdersTable(tbody);
    else if (tableId === 'couponsTable') renderCouponsTable(tbody);
  }

  // ---- Search Filters ----

  function initSearchFilters() {
    var userSearch = document.getElementById('userSearch');
    if (userSearch) {
      userSearch.addEventListener('input', function() {
        var query = this.value.toLowerCase();
        var tbody = document.getElementById('usersTableBody');
        if (!tbody) return;
        var filtered = allUsers.filter(function(u) {
          return (u.name || '').toLowerCase().indexOf(query) !== -1 ||
                 (u.email || '').toLowerCase().indexOf(query) !== -1 ||
                 (u.id || '').toLowerCase().indexOf(query) !== -1;
        });
        renderUsersTable(tbody, filtered);
      });
    }
  }

  // ---- Status Filter ----

  function initStatusFilter() {
    var filterEl = document.getElementById('orderStatusFilter');
    if (!filterEl) return;
    filterEl.addEventListener('change', function() {
      orderStatusFilter = this.value;
      var tbody = document.getElementById('ordersTableBody');
      if (tbody) renderOrdersTable(tbody);
    });
  }

  // ---- Stats ----

  async function loadStats() {
    try {
      var fbFirestore = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
      var ordersRef = fbFirestore.collection(db.firestore, 'orders');
      var ordersSnap = await fbFirestore.getDocs(ordersRef);

      var totalRevenue = 0;
      var totalOrders = 0;
      ordersSnap.forEach(function(docSnap) {
        var order = docSnap.data();
        totalRevenue += order.total || 0;
        totalOrders++;
      });

      var usersRef = fbFirestore.collection(db.firestore, 'users');
      var usersSnap = await fbFirestore.getDocs(usersRef);
      var totalUsers = usersSnap.size;

      // Default: assume 1000 unique visitors for conversion rate calculation
      var uniqueVisitors = 1000;
      var conversionRate = totalOrders > 0 ? ((totalOrders / uniqueVisitors) * 100).toFixed(1) + '%' : '0%';

      var revenueEl = document.getElementById('totalRevenue');
      if (revenueEl) revenueEl.textContent = formatCurrency(totalRevenue);

      var usersEl = document.getElementById('totalUsers');
      if (usersEl) usersEl.textContent = totalUsers;

      var ordersEl = document.getElementById('totalOrders');
      if (ordersEl) ordersEl.textContent = totalOrders;

      var conversionEl = document.getElementById('conversionRate');
      if (conversionEl) conversionEl.textContent = conversionRate;
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }

  // ---- Users ----

  async function loadUsers() {
    try {
      var fbFirestore = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
      var usersRef = fbFirestore.collection(db.firestore, 'users');
      var snapshot = await fbFirestore.getDocs(usersRef);

      allUsers = [];
      snapshot.forEach(function(docSnap) {
        allUsers.push({ id: docSnap.id }).concat([docSnap.data()]);
        var data = docSnap.data();
        data.id = docSnap.id;
        allUsers[allUsers.length - 1] = data;
      });

      var tbody = document.getElementById('usersTableBody');
      if (tbody) renderUsersTable(tbody);
    } catch (error) {
      console.error('Failed to load users:', error);
      var tbody = document.getElementById('usersTableBody');
      if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Failed to load users</td></tr>';
    }
  }

  function renderUsersTable(tbody, data) {
    var users = data || allUsers;
    if (!users.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No users found</td></tr>';
      return;
    }
    var html = '';
    users.forEach(function(user) {
      var joined = formatDate(user.createdAt);
      var totalSpent = formatCurrency(user.total_spent || 0);
      var role = capitalize(user.role || 'user');
      html += '<tr>' +
        '<td>' + escapeHtml(user.id ? user.id.substring(0, 8) : '') + '</td>' +
        '<td>' + escapeHtml(user.name || '\u2014') + '</td>' +
        '<td>' + escapeHtml(user.email || '\u2014') + '</td>' +
        '<td>' + escapeHtml(totalSpent) + '</td>' +
        '<td><span class="role-badge ' + (user.role || 'user') + '">' + role + '</span></td>' +
        '<td>' + escapeHtml(joined) + '</td>' +
      '</tr>';
    });
    tbody.innerHTML = html;
  }

  // ---- Orders ----

  async function loadOrders() {
    try {
      var fbFirestore = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
      var ordersRef = fbFirestore.collection(db.firestore, 'orders');
      var q = fbFirestore.query(ordersRef, fbFirestore.orderBy('createdAt', 'desc'));
      var snapshot = await fbFirestore.getDocs(q);

      allOrders = [];
      snapshot.forEach(function(docSnap) {
        var data = docSnap.data();
        data.id = docSnap.id;
        allOrders.push(data);
      });

      // Fetch user names for each order
      await enrichOrdersWithUserNames();

      var tbody = document.getElementById('ordersTableBody');
      if (tbody) renderOrdersTable(tbody);
    } catch (error) {
      console.error('Failed to load orders:', error);
      var tbody = document.getElementById('ordersTableBody');
      if (tbody) tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Failed to load orders</td></tr>';
    }
  }

  async function enrichOrdersWithUserNames() {
    try {
      var fbFirestore = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
      var userIds = [];
      var userMap = {};
      allOrders.forEach(function(order) {
        if (order.userId && userIds.indexOf(order.userId) === -1) {
          userIds.push(order.userId);
        }
      });
      for (var i = 0; i < userIds.length; i++) {
        try {
          var userRef = fbFirestore.doc(db.firestore, 'users', userIds[i]);
          var userSnap = await fbFirestore.getDoc(userRef);
          if (userSnap.exists()) {
            userMap[userIds[i]] = userSnap.data().name || userIds[i];
          } else {
            userMap[userIds[i]] = userIds[i];
          }
        } catch (e) {
          userMap[userIds[i]] = userIds[i];
        }
      }
      allOrders.forEach(function(order) {
        order.userName = userMap[order.userId] || order.userId;
      });
    } catch (error) {
      console.error('Failed to enrich orders:', error);
    }
  }

  function renderOrdersTable(tbody, data) {
    var orders = data || allOrders;
    if (orderStatusFilter && orderStatusFilter !== 'all') {
      orders = orders.filter(function(o) { return o.status === orderStatusFilter; });
    }
    if (!orders.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No orders found</td></tr>';
      return;
    }
    var html = '';
    orders.forEach(function(order) {
      var date = formatDate(order.createdAt);
      var status = capitalize(order.status || 'pending');
      html += '<tr>' +
        '<td>' + escapeHtml(order.id ? order.id.substring(0, 10) : '') + '</td>' +
        '<td>' + escapeHtml(order.userName || order.userId || '\u2014') + '</td>' +
        '<td>' + escapeHtml(formatCurrency(order.total)) + '</td>' +
        '<td><span class="status-badge ' + (order.status || 'pending') + '">' + status + '</span></td>' +
        '<td>' + escapeHtml(date) + '</td>' +
      '</tr>';
    });
    tbody.innerHTML = html;
  }

  // ---- Coupons ----

  async function loadCoupons() {
    try {
      var fbFirestore = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
      var couponsRef = fbFirestore.collection(db.firestore, 'coupons');
      var snapshot = await fbFirestore.getDocs(couponsRef);

      allCoupons = [];
      snapshot.forEach(function(docSnap) {
        var data = docSnap.data();
        data.id = docSnap.id;
        allCoupons.push(data);
      });

      // Enrich with user names
      await enrichCouponsWithUserNames();

      var tbody = document.getElementById('couponsTableBody');
      if (tbody) renderCouponsTable(tbody);
    } catch (error) {
      console.error('Failed to load coupons:', error);
      var tbody = document.getElementById('couponsTableBody');
      if (tbody) tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Failed to load coupons</td></tr>';
    }
  }

  async function enrichCouponsWithUserNames() {
    try {
      var fbFirestore = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
      var userIds = [];
      var userMap = {};
      allCoupons.forEach(function(coupon) {
        if (coupon.userId && userIds.indexOf(coupon.userId) === -1) {
          userIds.push(coupon.userId);
        }
      });
      for (var i = 0; i < userIds.length; i++) {
        try {
          var userRef = fbFirestore.doc(db.firestore, 'users', userIds[i]);
          var userSnap = await fbFirestore.getDoc(userRef);
          if (userSnap.exists()) {
            userMap[userIds[i]] = userSnap.data().name || userIds[i];
          } else {
            userMap[userIds[i]] = userIds[i];
          }
        } catch (e) {
          userMap[userIds[i]] = userIds[i];
        }
      }
      allCoupons.forEach(function(coupon) {
        coupon.userName = userMap[coupon.userId] || coupon.userId;
      });
    } catch (error) {
      console.error('Failed to enrich coupons:', error);
    }
  }

  function renderCouponsTable(tbody) {
    if (!allCoupons.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No coupons found</td></tr>';
      return;
    }
    var html = '';
    allCoupons.forEach(function(coupon) {
      var discount = coupon.discount + '%';
      var expires = coupon.expiresAt ? formatDate(coupon.expiresAt) : 'No expiry';
      var used = coupon.used ? 'Yes' : 'No';
      html += '<tr>' +
        '<td><code>' + escapeHtml(coupon.code || '\u2014') + '</code></td>' +
        '<td>' + escapeHtml(coupon.userName || coupon.userId || '\u2014') + '</td>' +
        '<td>' + escapeHtml(discount) + '</td>' +
        '<td>' + escapeHtml(expires) + '</td>' +
        '<td>' + escapeHtml(used) + '</td>' +
      '</tr>';
    });
    tbody.innerHTML = html;
  }

  // ---- Announcement Editor ----

  function initAnnouncementEditor() {
    var saveBtn = document.getElementById('saveAnnouncement');
    if (saveBtn) {
      saveBtn.addEventListener('click', saveAnnouncement);
    }
    loadAnnouncement();
  }

  async function loadAnnouncement() {
    try {
      var fbFirestore = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
      var docRef = fbFirestore.doc(db.firestore, 'config', 'announcement');
      var docSnap = await fbFirestore.getDoc(docRef);
      var textEl = document.getElementById('announcementText');
      if (docSnap.exists() && textEl) {
        var data = docSnap.data();
        textEl.value = data.message || '';
      }
    } catch (error) {
      console.error('Failed to load announcement:', error);
    }
  }

  async function saveAnnouncement() {
    var textEl = document.getElementById('announcementText');
    if (!textEl) return;
    var message = textEl.value.trim();
    if (!message) {
      showToast('Announcement message cannot be empty', 'error');
      return;
    }
    try {
      var fbFirestore = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
      var docRef = fbFirestore.doc(db.firestore, 'config', 'announcement');
      await fbFirestore.setDoc(docRef, {
        message: message,
        active: true,
        updatedAt: fbFirestore.serverTimestamp()
      }, { merge: true });
      showToast('Announcement saved successfully', 'success');
    } catch (error) {
      console.error('Failed to save announcement:', error);
      showToast('Failed to save announcement', 'error');
    }
  }

  // ---- Transaction Log ----

  function initTransactionLog() {
    loadTransactionLog();
    var refreshBtn = document.getElementById('refreshTransactions');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', loadTransactionLog);
    }
  }

  async function loadTransactionLog() {
    try {
      var fbFirestore = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
      var ordersRef = fbFirestore.collection(db.firestore, 'orders');
      var q = fbFirestore.query(ordersRef, fbFirestore.orderBy('createdAt', 'desc'), fbFirestore.limit(50));
      var snapshot = await fbFirestore.getDocs(q);

      var tbody = document.getElementById('transactionsTableBody');
      if (!tbody) return;

      if (snapshot.empty) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No transactions found</td></tr>';
        return;
      }

      var html = '';
      snapshot.forEach(function(docSnap) {
        var order = docSnap.data();
        var timestamp = formatDateTime(order.createdAt);
        var status = capitalize(order.status || 'pending');
        var userId = order.userId || 'unknown';
        var shortId = docSnap.id ? docSnap.id.substring(0, 10) : '';

        html += '<tr>' +
          '<td>' + escapeHtml(timestamp) + '</td>' +
          '<td>createOrder</td>' +
          '<td>orders</td>' +
          '<td><code>' + escapeHtml(shortId) + '</code></td>' +
          '<td><span class="status-badge ' + (order.status || 'pending') + '">' + status + '</span></td>' +
        '</tr>';
      });
      tbody.innerHTML = html;
    } catch (error) {
      console.error('Failed to load transaction log:', error);
      var tbody = document.getElementById('transactionsTableBody');
      if (tbody) tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Failed to load transactions</td></tr>';
    }
  }

  // ---- Logout ----

  async function setupLogout() {
    var logoutBtn = document.getElementById('logoutBtn');
    if (!logoutBtn) return;
    logoutBtn.addEventListener('click', async function() {
      try {
        var fbAuth = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
        await fbAuth.signOut(db.auth);
        showToast('Signed out successfully', 'success');
        window.location.href = '../index.html';
      } catch (error) {
        console.error('Logout failed:', error);
        showToast('Failed to sign out', 'error');
      }
    });
  }

  // ---- Scroll Reveal ----

  function setupScrollReveal() {
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
\n// --- CSV Export Logic ---
  async function exportDataToCSV(collectionName) {
    if (!window.db || !window.db.firestore) {
      if(window.showToast) window.showToast('Database not ready', 'error');
      return;
    }
    try {
      const fbFirestore = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
      const ref = fbFirestore.collection(window.db.firestore, collectionName);
      const snapshot = await fbFirestore.getDocs(ref);
      
      if (snapshot.empty) {
        if(window.showToast) window.showToast('No data to export', 'info');
        return;
      }

      let csv = [];
      let headersConfigured = false;
      let headers = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        if (!headersConfigured) {
          headers = Object.keys(data).filter(k => typeof data[k] !== 'object');
          headers.unshift('id'); 
          csv.push(headers.join(','));
          headersConfigured = true;
        }

        let row = [doc.id];
        headers.slice(1).forEach(header => {
          let val = data[header];
          if (val === undefined || val === null) val = '';
          val = String(val).replace(/"/g, '""');
          row.push('"' + val + '"');
        });
        csv.push(row.join(','));
      });

      const blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', collectionName + '_export_' + new Date().getTime() + '.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if(window.showToast) window.showToast('Downloaded ' + collectionName + '.csv', 'success');

    } catch (e) {
      console.error('CSV Export Error:', e);
      if(window.showToast) window.showToast('Error exporting data', 'error');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    let btnOrders = document.getElementById('exportOrdersCsvBtn');
    let btnUsers = document.getElementById('exportUsersCsvBtn');
    if(btnOrders) btnOrders.addEventListener('click', () => exportDataToCSV('orders'));
    if(btnUsers) btnUsers.addEventListener('click', () => exportDataToCSV('users'));
  });
