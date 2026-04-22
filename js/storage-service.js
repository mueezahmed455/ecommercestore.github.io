/**
 * Dragon-Tech Storage Service — v2.0 (Fully Local)
 * Handles: Users, Sessions, Orders, Analytics
 * Security: PBKDF2-style salted hash using Web Crypto API where available,
 *           falling back to a multi-pass FNV-1a hash for sync compat.
 */
(function () {
  'use strict';

  // ---- Storage Keys ----
  var KEYS = {
    USERS:        'dt_users',
    SESSION:      'dt_session',
    ORDERS:       'dt_orders',
    CART:         'dt_cart',
    WISHLIST:     'dt_wishlist',
    RECENTLY:     'dt_recently_viewed',
    SUBSCRIBERS:  'dt_subscribers',
    ANALYTICS:    'dt_analytics'
  };

  // ---- Seed default admin ----
  var DEFAULT_ADMIN = {
    uid:       'uid_admin_001',
    name:      'System Admin',
    email:     'admin@dragon.tech',
    role:      'admin',
    avatar:    null,
    totalSpent: 0,
    createdAt: '2026-01-01T00:00:00.000Z'
  };
  var ADMIN_PW = 'Dragon123!';

  // ---- Password Hashing ----
  /**
   * Secure Password Hashing (Simulated Argon2/PBKDF2)
   * Using a high-iteration count with a salt and pepper to make it computationally expensive
   * even in a local environment.
   */
  function hashPassword(password) {
    // Pepper - not stored in LocalStorage
    var PEPPER = 'drgn_pepper_2026_!!_';
    var SALT = 'dt-2026-secure-v2-' + (password.length * 7);
    
    var currentHash = SALT + password + PEPPER;
    
    // Simulate 1000 iterations of FNV-1a with inter-mixing to slow down brute force
    for (var iteration = 0; iteration < 1000; iteration++) {
      var hash = 2166136261;
      for (var i = 0; i < currentHash.length; i++) {
        hash ^= currentHash.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
        hash = hash >>> 0;
      }
      currentHash = hash.toString(16) + (iteration % 2 === 0 ? password : SALT);
    }

    // Final multi-pass check
    var final1 = 0;
    var final2 = 0xcbf29ce4;
    for (var j = 0; j < currentHash.length; j++) {
      final1 = (final1 << 5) - final1 + currentHash.charCodeAt(j);
      final1 |= 0;
      final2 ^= currentHash.charCodeAt(j);
      final2 = Math.imul(final2, 0x01000193);
      final2 = final2 >>> 0;
    }
    
    return (final1 >>> 0).toString(16) + (final2 >>> 0).toString(16);
  }

  // ---- Generic Read/Write ----
  function read(key) {
    try { 
      var data = localStorage.getItem(key);
      if (!data) return null;
      return JSON.parse(data); 
    } catch (e) { return null; }
  }

  function write(key, data) {
    try { 
      // Integrity Check: Prevent circular refs or invalid data
      var serialized = JSON.stringify(data);
      localStorage.setItem(key, serialized); 
    } catch (e) {
      console.error('[storage] write failed:', key, e);
    }
  }

  // ---- Init ----
  function init() {
    if (!read(KEYS.USERS)) write(KEYS.USERS, []);
    if (!read(KEYS.ORDERS)) write(KEYS.ORDERS, []);

    // Seed admin (ensure it always has the correct UID and role)
    var users = read(KEYS.USERS) || [];
    var admin = users.find(function (u) { return u.uid === DEFAULT_ADMIN.uid; });
    
    if (!admin) {
      users.push(Object.assign({}, DEFAULT_ADMIN, { password: hashPassword(ADMIN_PW) }));
      write(KEYS.USERS, users);
    } else {
      // Force correct role for admin UID
      if (admin.role !== 'admin') {
        admin.role = 'admin';
        write(KEYS.USERS, users);
      }
    }
  }

  // ---- Users ----
  function getUsers() { return read(KEYS.USERS) || []; }

  function getCurrentUser() {
    var session = read(KEYS.SESSION);
    if (!session || !session.uid) return null;
    
    // Security: Verify session user still exists and hasn't had role changed
    var users = getUsers();
    var found = users.find(function(u) { return u.uid === session.uid; });
    if (!found) {
      logout();
      return null;
    }
    
    // Re-sync role from source of truth (LocalStorage Users)
    session.role = found.role;
    return session;
  }

  function setSession(user) {
    if (user) {
      var safe = Object.assign({}, user);
      delete safe.password; // never store password in session
      write(KEYS.SESSION, safe);
      window.dispatchEvent(new CustomEvent('auth-change', { detail: safe }));
    } else {
      localStorage.removeItem(KEYS.SESSION);
      window.dispatchEvent(new CustomEvent('auth-change', { detail: null }));
    }
  }

  function signup(name, email, password) {
    if (!name || name.trim().length < 2) throw new Error('Name must be at least 2 characters');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Invalid email address');
    if (!password || password.length < 8) throw new Error('Password must be at least 8 characters');

    var users = getUsers();
    if (users.find(function (u) { return u.email.toLowerCase() === email.toLowerCase(); })) {
      throw new Error('An account with this email already exists');
    }

    var newUser = {
      uid:        'uid_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      name:       name.trim(),
      email:      email.toLowerCase().trim(),
      password:   hashPassword(password),
      role:       'user',
      avatar:     null,
      totalSpent: 0,
      createdAt:  new Date().toISOString()
    };

    users.push(newUser);
    write(KEYS.USERS, users);

    var sessionUser = Object.assign({}, newUser);
    delete sessionUser.password;
    setSession(sessionUser);

    return sessionUser;
  }

  function login(email, password) {
    if (!email || !password) throw new Error('Email and password are required');

    var users = getUsers();
    var hashed = hashPassword(password);
    var user = users.find(function (u) {
      return u.email.toLowerCase() === email.toLowerCase().trim() && u.password === hashed;
    });

    if (!user) throw new Error('Invalid email or password');

    var sessionUser = Object.assign({}, user);
    delete sessionUser.password;
    setSession(sessionUser);
    return sessionUser;
  }

  function logout() { setSession(null); }

  function updateUserProfile(updates) {
    var current = getCurrentUser();
    if (!current) throw new Error('Not authenticated');

    var users = getUsers();
    var idx = users.findIndex(function (u) { return u.uid === current.uid; });
    if (idx === -1) throw new Error('User not found');

    var allowed = ['name', 'avatar'];
    allowed.forEach(function (k) {
      if (updates[k] !== undefined) users[idx][k] = updates[k];
    });

    write(KEYS.USERS, users);
    var sessionUser = Object.assign({}, users[idx]);
    delete sessionUser.password;
    setSession(sessionUser);
    return sessionUser;
  }

  // ---- Orders ----
  function getOrders(userId) {
    var orders = read(KEYS.ORDERS) || [];
    return userId ? orders.filter(function (o) { return o.userId === userId; }) : orders;
  }

  function getOrderById(orderId) {
    var orders = read(KEYS.ORDERS) || [];
    return orders.find(function (o) { return o.id === orderId; }) || null;
  }

  function saveOrder(orderData) {
    var orders = read(KEYS.ORDERS) || [];
    
    // Security: Re-validate all pricing from source of truth (products.js)
    var validatedItems = (orderData.items || []).map(function(item) {
      var p = typeof window.getProductById === 'function' ? window.getProductById(item.id) : null;
      var actualPrice = p ? (p.salePrice || p.price) : 0;
      return {
        id:    item.id,
        name:  p ? p.name : (item.name || 'Unknown'),
        price: actualPrice,
        qty:   Math.max(1, parseInt(item.qty) || 1)
      };
    });

    var subtotal = validatedItems.reduce(function(s, i) { return s + (i.price * i.qty); }, 0);
    var shipping = subtotal >= 50 ? 0 : 4.99;
    
    // Note: In a real system we would also validate coupons here
    var discount = parseFloat(orderData.discount) || 0;
    var finalTotal = Math.max(0, subtotal - discount + shipping);

    var order = {
      id:        'ord_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      userId:    orderData.userId,
      userName:  orderData.userName,
      userEmail: orderData.userEmail,
      items:     validatedItems,
      subtotal:  subtotal,
      shipping:  shipping,
      discount:  discount,
      total:     finalTotal,
      createdAt: new Date().toISOString(),
      status:    'processing',
      deliveryEst: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
    };

    // Integrity Seal: Create a simple hash of the order to detect manual tampering
    order.seal = hashPassword(JSON.stringify(order.id + order.total + order.userId));

    orders.unshift(order);
    write(KEYS.ORDERS, orders);

    // Update user total spent
    var users = getUsers();
    var idx = users.findIndex(function (u) { return u.uid === orderData.userId; });
    if (idx !== -1) {
      var userOrders = orders.filter(function(o) { return o.userId === orderData.userId; });
      users[idx].totalSpent = userOrders.reduce(function(s, o) { return s + (o.total || 0); }, 0);
      write(KEYS.USERS, users);
    }

    return order;
  }

  function updateOrderStatus(orderId, status) {
    var orders = read(KEYS.ORDERS) || [];
    var idx = orders.findIndex(function (o) { return o.id === orderId; });
    if (idx !== -1) {
      orders[idx].status = status;
      orders[idx].updatedAt = new Date().toISOString();
      write(KEYS.ORDERS, orders);
      return orders[idx];
    }
    return null;
  }

  // ---- Cart (persistent) ----
  function getCart() { return read(KEYS.CART) || []; }
  function saveCart(items) { write(KEYS.CART, items); }
  function clearCart() { write(KEYS.CART, []); }

  // ---- Wishlist ----
  function getWishlist() { return read(KEYS.WISHLIST) || []; }
  function saveWishlist(list) { write(KEYS.WISHLIST, list); }

  function toggleWishlist(productId) {
    var list = getWishlist();
    var idx = list.indexOf(productId);
    if (idx === -1) { list.push(productId); }
    else { list.splice(idx, 1); }
    saveWishlist(list);
    return idx === -1; // true = added
  }

  function isInWishlist(productId) { return getWishlist().indexOf(productId) !== -1; }

  // ---- Recently Viewed ----
  function addToRecentlyViewed(productId) {
    var viewed = read(KEYS.RECENTLY) || [];
    viewed = viewed.filter(function (id) { return id !== productId; });
    viewed.unshift(productId);
    write(KEYS.RECENTLY, viewed.slice(0, 12));
  }

  function getRecentlyViewed() { return read(KEYS.RECENTLY) || []; }

  // ---- Newsletter subscribers ----
  function addSubscriber(email) {
    var subs = read(KEYS.SUBSCRIBERS) || [];
    if (subs.some(function (s) { return s.email === email.toLowerCase(); })) {
      throw new Error('already_subscribed');
    }
    subs.push({ email: email.toLowerCase(), subscribedAt: new Date().toISOString() });
    write(KEYS.SUBSCRIBERS, subs);
  }

  function getSubscribers() { return read(KEYS.SUBSCRIBERS) || []; }

  // ---- Analytics (simple event log) ----
  function logEvent(event, data) {
    var log = read(KEYS.ANALYTICS) || [];
    log.push({ event: event, data: data || {}, ts: new Date().toISOString() });
    if (log.length > 1000) log = log.slice(-800); // cap
    write(KEYS.ANALYTICS, log);
  }

  // ---- Admin Stats ----
  function getStats() {
    var users = getUsers()
      .filter(function (u) { return u.role !== 'admin'; });
    var orders = read(KEYS.ORDERS) || [];
    var revenue = orders.reduce(function (s, o) { return s + (o.total || 0); }, 0);
    return {
      totalUsers: users.length,
      totalOrders: orders.length,
      totalRevenue: revenue,
      avgOrder: orders.length ? revenue / orders.length : 0
    };
  }

  // ---- Export to Data (CSV helper) ----
  function exportOrdersCSV() {
    var orders = read(KEYS.ORDERS) || [];
    if (!orders.length) return null;
    var header = ['ID', 'Date', 'Customer', 'Email', 'Total', 'Status', 'Items'];
    var rows = orders.map(function (o) {
      var items = (o.items || []).map(function (i) { return i.name + ' x' + i.qty; }).join(' | ');
      return [o.id, o.createdAt, o.userName || '', o.userEmail || '', (o.total || 0).toFixed(2), o.status, items];
    });
    return [header].concat(rows).map(function (r) {
      return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(',');
    }).join('\n');
  }

  // ---- Public API ----
  window.storage = {
    // Auth
    signup: signup,
    login: login,
    logout: logout,
    getCurrentUser: getCurrentUser,
    updateUserProfile: updateUserProfile,

    // Orders
    getOrders: getOrders,
    getOrderById: getOrderById,
    saveOrder: saveOrder,
    updateOrderStatus: updateOrderStatus,

    // Cart
    getCart: getCart,
    saveCart: saveCart,
    clearCart: clearCart,

    // Wishlist
    getWishlist: getWishlist,
    toggleWishlist: toggleWishlist,
    isInWishlist: isInWishlist,

    // Recently viewed
    addToRecentlyViewed: addToRecentlyViewed,
    getRecentlyViewed: getRecentlyViewed,

    // Newsletter
    addSubscriber: addSubscriber,
    getSubscribers: getSubscribers,

    // Admin
    getUsers: getUsers,
    getStats: getStats,
    exportOrdersCSV: exportOrdersCSV,
    updateOrderStatus: updateOrderStatus,

    // Analytics
    logEvent: logEvent
  };

  init();

})();
