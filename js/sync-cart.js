/**
 * Cart Sync Module
 * Syncs localStorage cart with Firestore on login/logout and across devices.
 */
(function() {
  'use strict';

  var CART_STORAGE_KEY = 'dragon_cart';
  var _unsubscribe = null;
  var _syncInterval = null;
  var _isInitialized = false;

  // ---- Utilities ----

  function getLocalStorageCart() {
    try {
      var data = localStorage.getItem(CART_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to parse cart for sync:', e);
      return [];
    }
  }

  function saveLocalStorageCart(cart) {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      if (window.cart && window.cart.updateCartUI) {
        window.cart.updateCartUI();
      }
    } catch (e) {
      console.error('Failed to save cart for sync:', e);
    }
  }

  function mergeCarts(localCart, cloudCart) {
    var merged = localCart.slice();

    cloudCart.forEach(function(cloudItem) {
      var existing = merged.find(function(item) { return item.id === cloudItem.id; });
      if (existing) {
        existing.qty += cloudItem.qty;
      } else {
        merged.push({ id: cloudItem.id, qty: cloudItem.qty });
      }
    });

    return merged;
  }

  // ---- Firestore helpers (dynamic import) ----

  async function getFirestoreModule() {
    return await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
  }

  function getCurrentUser() {
    if (window.db && window.db.auth && window.db.auth.currentUser) {
      return window.db.auth.currentUser;
    }
    return null;
  }

  // ---- Sync: localStorage -> Firestore ----

  async function syncToCloud() {
    var user = getCurrentUser();
    if (!user) {
      console.warn('syncToCloud: no user logged in');
      return;
    }

    var localCart = getLocalStorageCart();
    if (localCart.length === 0) return;

    try {
      var fbFirestore = await getFirestoreModule();
      var itemsRef = fbFirestore.collection(window.db.firestore, 'users', user.uid, 'cart', 'items');

      // Write each cart item to Firestore (set with merge to handle upsert)
      var writes = localCart.map(function(item) {
        var docRef = fbFirestore.doc(itemsRef, item.id);
        return fbFirestore.setDoc(docRef, { productId: item.id, qty: item.qty }, { merge: true });
      });

      await Promise.all(writes);
    } catch (error) {
      console.error('syncToCloud failed:', error);
    }
  }

  // ---- Sync: Firestore -> localStorage ----

  async function syncFromCloud() {
    var user = getCurrentUser();
    if (!user) {
      console.warn('syncFromCloud: no user logged in');
      return;
    }

    try {
      var fbFirestore = await getFirestoreModule();
      var itemsRef = fbFirestore.collection(window.db.firestore, 'users', user.uid, 'cart', 'items');
      var snapshot = await fbFirestore.getDocs(itemsRef);

      var cloudCart = [];
      snapshot.docs.forEach(function(docSnap) {
        var data = docSnap.data();
        if (data.productId && data.qty) {
          cloudCart.push({ id: data.productId, qty: data.qty });
        }
      });

      if (cloudCart.length === 0) return;

      var localCart = getLocalStorageCart();
      var merged = mergeCarts(localCart, cloudCart);

      saveLocalStorageCart(merged);
      await syncToCloud();
    } catch (error) {
      console.error('syncFromCloud failed:', error);
    }
  }

  // ---- Auth state handling ----

  async function handleLogin() {
    await syncFromCloud();
    startRealtimeSync();
  }

  async function handleLogout() {
    stopRealtimeSync();
    var user = getCurrentUser();
    if (!user) return;

    try {
      var fbFirestore = await getFirestoreModule();
      var localCart = getLocalStorageCart();

      // Save local cart to Firestore before clearing
      var itemsRef = fbFirestore.collection(window.db.firestore, 'users', user.uid, 'cart', 'items');

      // Clear existing cloud items first
      var existingSnapshot = await fbFirestore.getDocs(itemsRef);
      var deletes = [];
      existingSnapshot.docs.forEach(function(docSnap) {
        deletes.push(fbFirestore.deleteDoc(docSnap.ref));
      });
      if (deletes.length > 0) {
        await Promise.all(deletes);
      }

      // Write local cart items
      var writes = localCart.map(function(item) {
        var docRef = fbFirestore.doc(itemsRef, item.id);
        return fbFirestore.setDoc(docRef, { productId: item.id, qty: item.qty }, { merge: true });
      });
      if (writes.length > 0) {
        await Promise.all(writes);
      }
    } catch (error) {
      console.error('handleLogout: failed to save cart to cloud:', error);
    }

    saveLocalStorageCart([]);
  }

  // ---- Realtime sync ----

  function startRealtimeSync() {
    var user = getCurrentUser();
    if (!user) return;

    stopRealtimeSync();

    getFirestoreModule().then(function(fbFirestore) {
      var itemsRef = fbFirestore.collection(window.db.firestore, 'users', user.uid, 'cart', 'items');

      _unsubscribe = fbFirestore.onSnapshot(itemsRef, function(snapshot) {
        var cloudCart = [];
        snapshot.docs.forEach(function(docSnap) {
          var data = docSnap.data();
          if (data.productId && data.qty) {
            cloudCart.push({ id: data.productId, qty: data.qty });
          }
        });

        // Only update localStorage if cloud differs from local
        var localCart = getLocalStorageCart();
        var localTotal = localCart.reduce(function(sum, item) { return sum + item.qty; }, 0);
        var cloudTotal = cloudCart.reduce(function(sum, item) { return sum + item.qty; }, 0);

        if (localTotal !== cloudTotal || localCart.length !== cloudCart.length) {
          var merged = mergeCarts(localCart, cloudCart);
          saveLocalStorageCart(merged);
        }
      }, function(error) {
        console.error('Realtime cart sync error:', error);
      });

    }).catch(function(error) {
      console.error('startRealtimeSync: failed to load Firestore module:', error);
    });
  }

  function stopRealtimeSync() {
    if (_unsubscribe) {
      _unsubscribe();
      _unsubscribe = null;
    }
    if (_syncInterval) {
      clearInterval(_syncInterval);
      _syncInterval = null;
    }
  }

  // ---- Periodic fallback sync ----

  function startPeriodicSync() {
    if (_syncInterval) return;
    _syncInterval = setInterval(function() {
      if (getCurrentUser()) {
        syncToCloud().catch(function() {});
      }
    }, 30000);
  }

  function stopPeriodicSync() {
    if (_syncInterval) {
      clearInterval(_syncInterval);
      _syncInterval = null;
    }
  }

  // ---- Initialize on load ----

  function init() {
    if (_isInitialized) return;
    if (!window.db || !window.db.auth || !window.db.firestore) return;

    _isInitialized = true;

    var fbAuth = window.db.auth;
    var onAuthStateChanged = fbAuth.onAuthStateChanged;

    if (onAuthStateChanged) {
      onAuthStateChanged(fbAuth, function(user) {
        if (user) {
          handleLogin().catch(function() {});
          startPeriodicSync();
        } else {
          handleLogout().catch(function() {});
          stopPeriodicSync();
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ---- Public API ----

  window.syncCart = {
    syncToCloud: syncToCloud,
    syncFromCloud: syncFromCloud,
    startRealtimeSync: startRealtimeSync,
    stopRealtimeSync: stopRealtimeSync
  };

})();
