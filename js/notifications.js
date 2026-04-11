/**
 * Notifications Module
 * Firebase realtime notification bell for logged-in users.
 * Listens to Firestore notifications/{userId}.
 * Exposes window.notifications.
 */
(function() {
  'use strict';

  var BELL_CONTAINER_ID = 'notificationBell';
  var FIRESTORE_MODULE_URL = 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
  var AUTH_MODULE_URL = 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

  var currentUserId = null;
  var unsubscribeFn = null;
  var notificationsCache = [];
  var dropdownOpen = false;

  // ---- Utility helpers ----

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
  }

  function formatDate(ts) {
    if (!ts) return '';
    var d = ts.toDate ? ts.toDate() : new Date(ts);
    var now = new Date();
    var diffMs = now - d;
    var diffMins = Math.floor(diffMs / 60000);
    var diffHours = Math.floor(diffMs / 3600000);
    var diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return diffMins + 'm ago';
    if (diffHours < 24) return diffHours + 'h ago';
    if (diffDays < 7) return diffDays + 'd ago';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  function showToast(message, type) {
    if (window.showToast) {
      window.showToast(message, type || 'info');
    }
  }

  function getFirestoreFunctions() {
    return import(FIRESTORE_MODULE_URL).then(function(m) {
      return {
        collection: m.collection,
        doc: m.doc,
        query: m.query,
        orderBy: m.orderBy,
        limit: m.limit,
        where: m.where,
        updateDoc: m.updateDoc,
        serverTimestamp: m.serverTimestamp,
        onSnapshot: m.onSnapshot,
        writeBatch: m.writeBatch
      };
    });
  }

  function getAuthFunctions() {
    return import(AUTH_MODULE_URL).then(function(m) {
      return {
        onAuthStateChanged: m.onAuthStateChanged
      };
    });
  }

  // ---- Notification type helpers ----

  function getTypeIcon(type) {
    var icons = {
      order: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
      promo: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
      info: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };
    return icons[type] || icons.info;
  }

  function getTypeColor(type) {
    var colors = {
      order: '#22c55e',
      promo: '#a855f7',
      info: '#00d4ff'
    };
    return colors[type] || colors.info;
  }

  // ---- Firestore operations ----

  function listenToNotifications(userId) {
    return getFirestoreFunctions().then(function(fb) {
      var notificationsRef = fb.collection(window.db.firestore, 'notifications', userId);
      var q = fb.query(
        notificationsRef,
        fb.orderBy('createdAt', 'desc'),
        fb.limit(20)
      );

      if (unsubscribeFn) {
        unsubscribeFn();
        unsubscribeFn = null;
      }

      unsubscribeFn = fb.onSnapshot(q, function(snapshot) {
        notificationsCache = [];
        snapshot.forEach(function(doc) {
          notificationsCache.push(Object.assign({ id: doc.id }, doc.data()));
        });

        renderBell();
        if (dropdownOpen) {
          renderDropdown();
        }
      }, function(error) {
        console.error('Notifications listener error:', error);
      });
    });
  }

  async function markAsRead(notificationId) {
    if (!currentUserId || !notificationId) return;

    var fb = await getFirestoreFunctions();
    var notifRef = fb.doc(window.db.firestore, 'notifications', currentUserId, 'items', notificationId);
    await fb.updateDoc(notifRef, { read: true });
  }

  async function markAllAsRead() {
    if (!currentUserId) return;

    var fb = await getFirestoreFunctions();
    var unread = notificationsCache.filter(function(n) { return !n.read; });
    if (unread.length === 0) return;

    var batch = fb.writeBatch(window.db.firestore);
    unread.forEach(function(n) {
      var ref = fb.doc(window.db.firestore, 'notifications', currentUserId, 'items', n.id);
      batch.update(ref, { read: true });
    });

    await batch.commit();
    showToast('All notifications marked as read', 'info');
  }

  // ---- Rendering ----

  function getUnreadCount() {
    return notificationsCache.filter(function(n) { return !n.read; }).length;
  }

  function renderBell() {
    var bellEl = document.getElementById(BELL_CONTAINER_ID);
    if (!bellEl) return;

    // Only show for logged-in users
    if (!currentUserId) {
      bellEl.innerHTML = '';
      return;
    }

    var unread = getUnreadCount();
    var badgeHtml = unread > 0
      ? '<span class="notif-badge" aria-label="' + unread + ' unread notifications">' + (unread > 99 ? '99+' : unread) + '</span>'
      : '';

    bellEl.innerHTML =
      '<button class="notif-bell-btn" id="notifBellBtn" aria-label="Notifications" aria-haspopup="true" aria-expanded="false">' +
        '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
          '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>' +
          '<path d="M13.73 21a2 2 0 0 1-3.46 0"/>' +
        '</svg>' +
        badgeHtml +
      '</button>' +
      '<div class="notif-dropdown" id="notifDropdown" role="menu" aria-hidden="true"></div>';

    // Attach click handler
    var btn = bellEl.querySelector('#notifBellBtn');
    if (btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleDropdown();
      });
    }
  }

  function renderDropdown() {
    var dropdown = document.getElementById('notifDropdown');
    if (!dropdown) return;

    if (notificationsCache.length === 0) {
      dropdown.innerHTML = '<div class="notif-empty">No notifications yet</div>';
      return;
    }

    var html = '<div class="notif-dropdown-header">' +
      '<span class="notif-dropdown-title">Notifications</span>' +
      '<button class="mark-all-read-btn" id="markAllReadBtn">Mark all as read</button>' +
    '</div>';

    html += '<div class="notif-list">';
    notificationsCache.forEach(function(notif) {
      var readClass = notif.read ? ' notif-read' : ' notif-unread';
      var iconColor = getTypeColor(notif.type || 'info');

      html += '<div class="notif-item' + readClass + '" data-notif-id="' + escapeHtml(notif.id) + '" role="menuitem">' +
        '<span class="notif-icon" style="color:' + iconColor + '">' + getTypeIcon(notif.type || 'info') + '</span>' +
        '<div class="notif-content">' +
          '<div class="notif-title">' + escapeHtml(notif.title || 'Notification') + '</div>' +
          '<div class="notif-message">' + escapeHtml(notif.message || '') + '</div>' +
          '<div class="notif-time">' + formatDate(notif.createdAt) + '</div>' +
        '</div>' +
        (!notif.read ? '<span class="notif-unread-dot"></span>' : '') +
      '</div>';
    });
    html += '</div>';

    dropdown.innerHTML = html;

    // Attach mark-all handler
    var markAllBtn = dropdown.querySelector('#markAllReadBtn');
    if (markAllBtn) {
      markAllBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        markAllAsRead();
      });
    }

    // Attach item click handlers
    var items = dropdown.querySelectorAll('.notif-item');
    items.forEach(function(item) {
      item.addEventListener('click', function() {
        var notifId = this.getAttribute('data-notif-id');
        if (notifId) {
          markAsRead(notifId);
        }
      });
    });
  }

  function toggleDropdown() {
    var dropdown = document.getElementById('notifDropdown');
    var btn = document.getElementById('notifBellBtn');
    if (!dropdown || !btn) return;

    dropdownOpen = !dropdownOpen;

    if (dropdownOpen) {
      dropdown.style.display = 'block';
      dropdown.setAttribute('aria-hidden', 'false');
      btn.setAttribute('aria-expanded', 'true');
      renderDropdown();
    } else {
      dropdown.style.display = 'none';
      dropdown.setAttribute('aria-hidden', 'true');
      btn.setAttribute('aria-expanded', 'false');
    }
  }

  function closeDropdown() {
    var dropdown = document.getElementById('notifDropdown');
    var btn = document.getElementById('notifBellBtn');
    if (!dropdown) return;

    dropdownOpen = false;
    dropdown.style.display = 'none';
    dropdown.setAttribute('aria-hidden', 'true');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  // ---- Auth state management ----

  function initAuthListener() {
    if (!window.db || !window.db.auth) {
      console.warn('notifications.js: window.db.auth not available');
      return;
    }

    // Use onAuthStateChanged directly (already loaded by the main script)
    if (window.db.auth.onAuthStateChanged) {
      window.db.auth.onAuthStateChanged(function(user) {
        handleAuthChange(user);
      });
    } else {
      // Fall back to dynamic import
      getAuthFunctions().then(function(authFb) {
        authFb.onAuthStateChanged(window.db.auth, function(user) {
          handleAuthChange(user);
        });
      });
    }
  }

  function handleAuthChange(user) {
    var bellEl = document.getElementById(BELL_CONTAINER_ID);
    if (!bellEl) return;

    if (user) {
      currentUserId = user.uid;
      renderBell();
      listenToNotifications(currentUserId);
    } else {
      if (unsubscribeFn) {
        unsubscribeFn();
        unsubscribeFn = null;
      }
      currentUserId = null;
      notificationsCache = [];
      renderBell();
    }
  }

  // ---- Public API ----

  window.notifications = {
    markAsRead: markAsRead,
    markAllAsRead: markAllAsRead,
    getUnreadCount: getUnreadCount,
    getNotifications: function() { return notificationsCache.slice(); },
    toggleDropdown: toggleDropdown,
    closeDropdown: closeDropdown
  };

  // ---- Self-initialize on auth state ----

  // Close dropdown on outside click
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      document.addEventListener('click', function(e) {
        var bellEl = document.getElementById(BELL_CONTAINER_ID);
        if (bellEl && !bellEl.contains(e.target)) {
          closeDropdown();
        }
      });

      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && dropdownOpen) {
          closeDropdown();
        }
      });

      initAuthListener();
    });
  } else {
    document.addEventListener('click', function(e) {
      var bellEl = document.getElementById(BELL_CONTAINER_ID);
      if (bellEl && !bellEl.contains(e.target)) {
        closeDropdown();
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && dropdownOpen) {
        closeDropdown();
      }
    });

    initAuthListener();
  }

})();
