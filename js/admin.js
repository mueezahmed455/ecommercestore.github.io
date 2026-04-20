/**
 * Admin Panel Module
 * Full admin dashboard: users, orders, coupons, announcement, transactions.
 * Simplified for Pure Static / LocalStorage version.
 */
(function() {
  'use strict';

  function capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
  }

  function formatDateTime(ts) {
    if (!ts) return '\u2014';
    var date = new Date(ts);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  function formatDate(ts) {
    if (!ts) return '\u2014';
    var date = new Date(ts);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  // ---- Auth Guard ----

  initAdminGuard();

  function initAdminGuard() {
    const user = window.storage.getCurrentUser();
    if (!user) {
      window.location.href = 'login.html';
      return;
    }
    // Static demo: allow anyone to see the dashboard, but in prod you'd check role
    initAdminPanel();
  }

  // ---- Main Initializer ----

  var allUsers = [];
  var allOrders = [];
  var allCoupons = [];
  var orderStatusFilter = 'all';
  var sortStates = {};

  function initAdminPanel() {
    initTabSwitching();
    initTableSorting();
    initStatusFilter();
    initSearchFilters();
    initAnnouncementEditor();
    initTransactionLog();
    setupLogout();
    setupScrollReveal();

    loadUsers();
    loadOrders();
    loadStats();
    loadCoupons();
  }

  // ---- Tab Switching ----

  function initTabSwitching() {
    var tabButtons = document.querySelectorAll('.tab-btn[data-tab]');
    tabButtons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var tabId = this.getAttribute('data-tab');
        if (!tabId) return;

        tabButtons.forEach(function(b) {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        this.classList.add('active');
        this.setAttribute('aria-selected', 'true');

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

        if (!sortStates[tableId]) sortStates[tableId] = {};
        var currentDir = sortStates[tableId][sortKey] || 'asc';
        var newDir = currentDir === 'asc' ? 'desc' : 'asc';
        sortStates[tableId][sortKey] = newDir;

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
      var valA = a[sortKey];
      var valB = b[sortKey];
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

  function renderTableData(tableId, tbody) {
    if (tableId === 'usersTable') renderUsersTable(tbody);
    else if (tableId === 'ordersTable') renderOrdersTable(tbody);
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
                 (u.email || '').toLowerCase().indexOf(query) !== -1;
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

  function loadStats() {
    const orders = window.storage.getOrders();
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrders = orders.length;

    var revenueEl = document.getElementById('totalRevenue');
    if (revenueEl) revenueEl.textContent = formatCurrency(totalRevenue);

    var ordersEl = document.getElementById('totalOrders');
    if (ordersEl) ordersEl.textContent = totalOrders;

    var usersEl = document.getElementById('totalUsers');
    const uniqueUserIds = new Set(orders.map(o => o.userId));
    if (usersEl) usersEl.textContent = Math.max(uniqueUserIds.size, 1);
  }

  // ---- Users ----

  function loadUsers() {
    allUsers = [
      { id: 'u_1', name: 'Admin User', email: 'admin@dragon.tech', role: 'admin', total_spent: 0, createdAt: new Date().toISOString() },
      { id: 'u_2', name: 'John Doe', email: 'john@example.com', role: 'user', total_spent: 350, createdAt: new Date().toISOString() }
    ];
    var tbody = document.getElementById('usersTableBody');
    if (tbody) renderUsersTable(tbody);
  }

  function renderUsersTable(tbody, data) {
    var users = data || allUsers;
    if (!users.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No users found</td></tr>';
      return;
    }
    var html = '';
    users.forEach(function(user) {
      html += '<tr>' +
        '<td>' + escapeHtml(user.id.substring(0, 8)) + '</td>' +
        '<td>' + escapeHtml(user.name || '\u2014') + '</td>' +
        '<td>' + escapeHtml(user.email || '\u2014') + '</td>' +
        '<td>' + formatCurrency(user.total_spent || 0) + '</td>' +
        '<td><span class="role-badge ' + (user.role || 'user') + '">' + capitalize(user.role) + '</span></td>' +
        '<td>' + formatDate(user.createdAt) + '</td>' +
      '</tr>';
    });
    tbody.innerHTML = html;
  }

  // ---- Orders ----

  function loadOrders() {
    allOrders = window.storage.getOrders();
    var tbody = document.getElementById('ordersTableBody');
    if (tbody) renderOrdersTable(tbody);
  }

  function renderOrdersTable(tbody, data) {
    var orders = data || allOrders;
    if (orderStatusFilter !== 'all') {
      orders = orders.filter(o => o.status === orderStatusFilter);
    }
    if (!orders.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No orders found</td></tr>';
      return;
    }
    var html = '';
    orders.forEach(function(order) {
      html += '<tr>' +
        '<td>' + escapeHtml(order.id.substring(0, 10)) + '</td>' +
        '<td>' + escapeHtml(order.userId || '\u2014') + '</td>' +
        '<td>' + formatCurrency(order.total) + '</td>' +
        '<td><span class="status-badge ' + (order.status || 'pending') + '">' + capitalize(order.status) + '</span></td>' +
        '<td>' + formatDate(order.createdAt) + '</td>' +
      '</tr>';
    });
    tbody.innerHTML = html;
  }

  // ---- Coupons ----

  function loadCoupons() {
    var tbody = document.getElementById('couponsTableBody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No active coupons</td></tr>';
  }

  // ---- Announcement Editor ----

  function initAnnouncementEditor() {
    var saveBtn = document.getElementById('saveAnnouncement');
    if (saveBtn) {
      saveBtn.addEventListener('click', function() {
        var msg = document.getElementById('announcementText').value;
        localStorage.setItem('dragon_announcement', msg);
        showToast('Announcement updated!', 'success');
      });
    }
    var msg = localStorage.getItem('dragon_announcement');
    if (msg) document.getElementById('announcementText').value = msg;
  }

  // ---- Transaction Log ----

  function initTransactionLog() {
    var orders = window.storage.getOrders();
    var tbody = document.getElementById('transactionsTableBody');
    if (!tbody) return;

    var html = '';
    orders.slice().reverse().forEach(function(order) {
      html += '<tr>' +
        '<td>' + formatDateTime(order.createdAt) + '</td>' +
        '<td>createOrder</td>' +
        '<td>orders</td>' +
        '<td><code>' + escapeHtml(order.id.substring(0, 10)) + '</code></td>' +
        '<td><span class="status-badge succeeded">Succeeded</span></td>' +
      '</tr>';
    });
    tbody.innerHTML = html || '<tr><td colspan="5" class="empty-state">No transactions</td></tr>';
  }

  // ---- Logout ----

  function setupLogout() {
    var logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function() {
        window.storage.logout();
        window.location.href = '../index.html';
      });
    }
  }

  function setupScrollReveal() {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  }

})();
