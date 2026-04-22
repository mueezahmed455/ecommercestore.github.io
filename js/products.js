/**
 * Dragon-Tech Product Catalog & Rendering — v2.0
 * Full catalog + PS5-style card rendering with all new design tokens.
 */
(function () {
  'use strict';

  // ============================================================
  //  PRODUCT CATALOG
  // ============================================================
  var PRODUCTS = [
    // ---- AUDIO ----
    { id: 'prod_001', name: 'Wireless Earbuds Pro', category: 'audio',
      description: 'Active noise cancellation, 36-hour total battery, spatial audio, IPX5 waterproof.',
      price: 79.99, salePrice: 59.99, image: 'assets/product-earbuds.svg',
      rating: 4.7, reviewsCount: 234, badge: 'sale', inStock: true, isFeatured: true },

    { id: 'prod_002', name: 'Smart Bluetooth Speaker', category: 'audio',
      description: '360° immersive sound, built-in voice assistant, multi-room audio, bass boost.',
      price: 49.99, salePrice: null, image: 'assets/product-speaker.svg',
      rating: 4.5, reviewsCount: 156, badge: null, inStock: true },

    { id: 'prod_003', name: 'Pro Gaming Headset', category: 'audio',
      description: '50mm drivers, detachable noise-cancelling mic, 60 hrs wireless battery, RGB.',
      price: 59.99, salePrice: 44.99, image: 'assets/product-headset.svg',
      rating: 4.6, reviewsCount: 189, badge: 'sale', inStock: true },

    { id: 'prod_004', name: 'USB Condenser Microphone', category: 'audio',
      description: 'Cardioid capsule, zero-latency monitoring, plug-and-play USB-C, pop filter.',
      price: 69.99, salePrice: null, image: 'assets/product-mic.svg',
      rating: 4.8, reviewsCount: 98, badge: 'new', inStock: true },

    // ---- WEARABLES ----
    { id: 'prod_005', name: 'Smart Watch Ultra', category: 'wearable',
      description: 'Sapphire crystal, titanium case, always-on AMOLED, GPS, 7-day battery.',
      price: 299.99, salePrice: 249.99, image: 'assets/product-watch.svg',
      rating: 4.8, reviewsCount: 312, badge: 'sale', inStock: true, isFeatured: true },

    { id: 'prod_006', name: 'Fitness Band Pro', category: 'wearable',
      description: 'Heart rate, SpO2, sleep & stress tracking, 14-day battery, slim design.',
      price: 49.99, salePrice: null, image: 'assets/product-fitness.svg',
      rating: 4.4, reviewsCount: 178, badge: null, inStock: true },

    // ---- COMPUTERS ----
    { id: 'prod_007', name: 'Ultrabook Pro 15"', category: 'computers',
      description: 'Next-gen chip, 16 GB RAM, 512 GB NVMe SSD, 15" Retina display, 20 hr battery.',
      price: 1299.99, salePrice: 1099.99, image: 'assets/product-laptop.svg',
      rating: 4.9, reviewsCount: 156, badge: 'sale', inStock: true, isFeatured: true },

    { id: 'prod_008', name: 'Ultra-Wide Monitor 34"', category: 'computers',
      description: 'WQHD curved IPS, 165 Hz, 1ms, HDR600, USB-C 90W power delivery.',
      price: 499.99, salePrice: 399.99, image: 'assets/product-monitor.svg',
      rating: 4.7, reviewsCount: 89, badge: 'sale', inStock: true },

    { id: 'prod_009', name: 'Pro Tablet 11"', category: 'computers',
      description: 'OLED ProMotion, stylus included, 12 GB RAM, 256 GB, all-day battery.',
      price: 599.99, salePrice: null, image: 'assets/product-tablet.svg',
      rating: 4.6, reviewsCount: 134, badge: 'new', inStock: true },

    // ---- ACCESSORIES ----
    { id: 'prod_010', name: 'Mechanical Keyboard TKL', category: 'accessories',
      description: 'Hot-swappable linear switches, per-key RGB, aircraft-grade aluminium frame.',
      price: 89.99, salePrice: 69.99, image: 'assets/product-keyboard.svg',
      rating: 4.7, reviewsCount: 267, badge: 'sale', inStock: true },

    { id: 'prod_011', name: 'Wireless Gaming Mouse', category: 'accessories',
      description: '25 K DPI optical sensor, 70 g ultralight, 80-hr battery, programmable RGB.',
      price: 59.99, salePrice: null, image: 'assets/product-mouse.svg',
      rating: 4.6, reviewsCount: 198, badge: null, inStock: true },

    { id: 'prod_012', name: 'Power Bank 20 000 mAh', category: 'accessories',
      description: 'USB-C PD 65 W, charges laptop + phone simultaneously, airline-safe.',
      price: 39.99, salePrice: null, image: 'assets/product-charger.svg',
      rating: 4.5, reviewsCount: 423, badge: 'bestseller', inStock: true, isFeatured: true },

    { id: 'prod_013', name: '4K Webcam Pro', category: 'accessories',
      description: 'Auto-focus, dual microphone array, HDR, low-light AI correction.',
      price: 79.99, salePrice: 59.99, image: 'assets/product-webcam.svg',
      rating: 4.4, reviewsCount: 145, badge: 'sale', inStock: true },

    { id: 'prod_014', name: 'USB-C Hub 8-in-1', category: 'accessories',
      description: 'HDMI 4K60, Ethernet, 3× USB-A, SD/MicroSD, 100 W PD passthrough.',
      price: 49.99, salePrice: null, image: 'assets/product-usb.svg',
      rating: 4.6, reviewsCount: 312, badge: null, inStock: true },

    { id: 'prod_015', name: 'Portable SSD 1 TB', category: 'accessories',
      description: 'NVMe speeds 1050 MB/s read, USB 3.2 Gen 2, anodised aluminium, drop-proof.',
      price: 99.99, salePrice: 79.99, image: 'assets/product-ssd.svg',
      rating: 4.8, reviewsCount: 456, badge: 'sale', inStock: true },

    { id: 'prod_016', name: 'Tri-Band WiFi 6E Router', category: 'accessories',
      description: 'Covers 5 500 sq ft, AI mesh routing, 12 streams, WPA3 security.',
      price: 299.99, salePrice: null, image: 'assets/product-router.svg',
      rating: 4.5, reviewsCount: 89, badge: 'new', inStock: true },

    // ---- BUNDLES ----
    { id: 'bundle_001', name: 'Creator Audio Bundle', category: 'bundles',
      description: 'Earbuds Pro + Bluetooth Speaker + USB Mic — complete audio studio setup.',
      price: 199.97, salePrice: 149.99, image: 'assets/product-earbuds.svg',
      rating: 4.8, reviewsCount: 67, badge: 'sale', inStock: true },

    { id: 'bundle_002', name: 'Work From Home Elite', category: 'bundles',
      description: 'Ultrabook Pro + 4K Webcam + USB Mic — remote work perfected.',
      price: 1449.97, salePrice: 1199.99, image: 'assets/product-laptop.svg',
      rating: 4.9, reviewsCount: 45, badge: 'bestseller', inStock: true, isFeatured: true },

    { id: 'bundle_003', name: 'Gaming Command Centre', category: 'bundles',
      description: 'Ultra-Wide Monitor + Gaming Headset + Mechanical Keyboard — dominate.',
      price: 649.97, salePrice: 499.99, image: 'assets/product-monitor.svg',
      rating: 4.7, reviewsCount: 34, badge: 'sale', inStock: true }
  ];

  // ============================================================
  //  HELPERS
  // ============================================================
  function esc(str) {
    return window.utils ? window.utils.escapeHtml(str) : String(str);
  }

  function fmt(usd) {
    return window.currency ? window.currency.formatPrice(usd) : '$' + usd.toFixed(2);
  }

  function stars(rating) {
    var full = Math.round(rating || 0);
    var h = '';
    for (var i = 1; i <= 5; i++) {
      h += '<span class="' + (i <= full ? 'star-full' : 'star-empty') + '">★</span>';
    }
    return h;
  }

  function badgeCls(badge) {
    var map = { sale: 'badge-sale', new: 'badge-new', bestseller: 'badge-bestseller', exclusive: 'badge-new' };
    return map[badge] || 'badge-new';
  }

  function badgeText(badge) {
    var map = { sale: 'SALE', new: 'NEW', bestseller: 'BEST', exclusive: 'EXCL' };
    return map[badge] || badge.toUpperCase();
  }

  function isWishlisted(id) {
    return window.storage ? window.storage.isInWishlist(id) : false;
  }

  // ============================================================
  //  CARD RENDERING
  // ============================================================
  function renderCard(product, idx) {
    var price     = product.salePrice || product.price;
    var origPrice = product.salePrice ? product.price : null;
    var discount  = origPrice ? Math.round((1 - product.salePrice / product.price) * 100) : 0;
    var wishd     = isWishlisted(product.id);

    return '<article class="product-card" role="listitem" data-id="' + product.id + '" ' +
             'style="animation-delay:' + (idx * 0.06) + 's" ' +
             'aria-label="' + esc(product.name) + '">' +

      // Out of stock overlay
      (!product.inStock ? '<div class="card-out-of-stock"><div class="oos-label">Out of Stock</div></div>' : '') +

      // Image
      '<div class="card-image-wrap">' +
        (product.badge ? '<span class="card-badge ' + badgeCls(product.badge) + '">' + badgeText(product.badge) + '</span>' : '') +
        '<img src="' + esc(product.image) + '" alt="' + esc(product.name) + '" loading="lazy">' +

        // Quick actions
        '<div class="card-actions">' +
          '<button class="card-action-btn wishlist-toggle' + (wishd ? ' active' : '') + '" ' +
                  'data-id="' + product.id + '" aria-label="Toggle wishlist" title="Wishlist">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="' + (wishd ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="2">' +
              '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>' +
            '</svg>' +
          '</button>' +
          '<button class="card-action-btn quick-view-btn" data-id="' + product.id + '" aria-label="Quick view" title="Quick View">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
              '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>' +
            '</svg>' +
          '</button>' +
        '</div>' +
      '</div>' +

      // Body
      '<div class="card-body">' +
        '<div class="card-category">' + esc(product.category) + '</div>' +
        '<h3 class="card-name">' + esc(product.name) + '</h3>' +
        '<p class="card-desc">' + esc(product.description) + '</p>' +

        // Stars
        '<div class="card-stars">' +
          stars(product.rating) +
          '<span class="review-count">(' + (product.reviewsCount || 0) + ')</span>' +
        '</div>' +

        // Footer
        '<div class="card-footer">' +
          '<div class="card-pricing">' +
            '<span class="card-price price-display" data-price-usd="' + price + '">' + fmt(price) + '</span>' +
            (origPrice ? '<span class="card-original price-display" data-price-usd="' + origPrice + '">' + fmt(origPrice) + '</span>' : '') +
            (discount > 0 ? '<span class="card-discount">-' + discount + '%</span>' : '') +
          '</div>' +
          (product.inStock
            ? '<button class="btn-add-cart" data-id="' + product.id + '" aria-label="Add ' + esc(product.name) + ' to cart">Add to Cart</button>'
            : '<span style="font-size:0.8rem;color:var(--text-muted);">Unavailable</span>') +
        '</div>' +
      '</div>' +
    '</article>';
  }

  // ============================================================
  //  RENDER GRID
  // ============================================================
  function renderGrid(items) {
    var grid = document.getElementById('productsGrid');
    if (!grid) return;

    if (!items.length) {
      grid.innerHTML =
        '<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--text-muted);">' +
          '<div style="font-size:3rem;margin-bottom:12px;">🔍</div>' +
          '<p style="font-size:1rem;">No products match your search.</p>' +
          '<button class="btn btn-outline btn-sm" id="clearFiltersBtn" style="margin-top:16px;">Clear Filters</button>' +
        '</div>';
      var cb = grid.querySelector('#clearFiltersBtn');
      if (cb) cb.addEventListener('click', function () { resetFilters(); });
      return;
    }

    grid.innerHTML = items.map(renderCard).join('');

    // Event delegation
    grid.addEventListener('click', function (e) {
      // Add to cart
      var addBtn = e.target.closest('.btn-add-cart');
      if (addBtn) {
        e.stopPropagation();
        var id = addBtn.getAttribute('data-id');
        if (window.cart && window.cart.addToCart) {
          window.cart.addToCart(id);
          addBtn.textContent = '✓ Added';
          addBtn.classList.add('added');
          setTimeout(function () {
            addBtn.textContent = 'Add to Cart';
            addBtn.classList.remove('added');
          }, 1600);
        }
        return;
      }

      // Wishlist toggle
      var wlBtn = e.target.closest('.wishlist-toggle');
      if (wlBtn) {
        e.stopPropagation();
        var wid = wlBtn.getAttribute('data-id');
        if (window.storage) {
          var added = window.storage.toggleWishlist(wid);
          wlBtn.classList.toggle('active', added);
          wlBtn.querySelector('svg path').setAttribute('fill', added ? 'currentColor' : 'none');
          if (window.utils) window.utils.showToast(added ? 'Added to Wishlist' : 'Removed from Wishlist', added ? 'success' : 'info');
          // Update wishlist badge
          updateWishlistBadge();
        }
        return;
      }

      // Quick view / card click
      var qvBtn = e.target.closest('.quick-view-btn');
      var card  = e.target.closest('.product-card');
      var pid   = (qvBtn || card) ? ((qvBtn || card).getAttribute('data-id')) : null;
      if (pid && window.openProductModal) {
        window.openProductModal(pid);
        if (window.storage) window.storage.addToRecentlyViewed(pid);
      }
    });
  }

  function updateWishlistBadge() {
    var badge = document.getElementById('wishlistBadge');
    if (!badge) return;
    var count = window.storage ? window.storage.getWishlist().length : 0;
    badge.textContent = count;
    badge.classList.toggle('show', count > 0);
  }

  // ============================================================
  //  FILTER & SORT
  // ============================================================
  var activeFilters = { category: 'all', search: '', sort: 'default', stock: 'all' };

  function applyFilters() {
    var f       = activeFilters;
    var term    = f.search.toLowerCase().trim();

    var result = PRODUCTS.filter(function (p) {
      var catOk    = f.category === 'all' || p.category === f.category;
      var searchOk = !term ||
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term);
      var stockOk  = f.stock === 'all'
        ? true
        : f.stock === 'in-stock' ? p.inStock !== false
        : f.stock === 'sale' ? !!p.salePrice
        : true;
      return catOk && searchOk && stockOk;
    });

    switch (f.sort) {
      case 'price-low':    result.sort(function (a, b) { return (a.salePrice || a.price) - (b.salePrice || b.price); }); break;
      case 'price-high':   result.sort(function (a, b) { return (b.salePrice || b.price) - (a.salePrice || a.price); }); break;
      case 'rating':       result.sort(function (a, b) { return (b.rating || 0) - (a.rating || 0); }); break;
      case 'discount':     result.sort(function (a, b) {
        var da = a.salePrice ? (1 - a.salePrice / a.price) : 0;
        var db = b.salePrice ? (1 - b.salePrice / b.price) : 0;
        return db - da;
      }); break;
    }

    renderGrid(result);
    updateWishlistBadge();
  }

  function resetFilters() {
    activeFilters = { category: 'all', search: '', sort: 'default', stock: 'all' };
    var si = document.getElementById('searchInput');
    var sf = document.getElementById('sortFilter');
    var stf = document.getElementById('stockFilter');
    if (si) si.value = '';
    if (sf) sf.value = 'default';
    if (stf) stf.value = 'all';
    document.querySelectorAll('.cat-tab').forEach(function (t) {
      t.classList.toggle('active', t.getAttribute('data-category') === 'all');
    });
    applyFilters();
  }

  // ============================================================
  //  CONTROLS
  // ============================================================
  function initControls() {
    var searchEl = document.getElementById('searchInput');
    var sortEl   = document.getElementById('sortFilter');
    var stockEl  = document.getElementById('stockFilter');

    if (searchEl) {
      searchEl.addEventListener('input', window.utils
        ? window.utils.debounce(function () { activeFilters.search = searchEl.value; applyFilters(); }, 280)
        : function () { activeFilters.search = searchEl.value; applyFilters(); });
    }
    if (sortEl)  sortEl.addEventListener('change', function () { activeFilters.sort  = this.value; applyFilters(); });
    if (stockEl) stockEl.addEventListener('change', function () { activeFilters.stock = this.value; applyFilters(); });

    // Category tabs (delegated) — also wired from index.html but handled here for completeness
    document.addEventListener('click', function (e) {
      var tab = e.target.closest('.cat-tab[data-category]');
      if (!tab) return;
      activeFilters.category = tab.getAttribute('data-category');
      applyFilters();
    });
  }

  // ============================================================
  //  PUBLIC API
  // ============================================================
  window.PRODUCTS         = PRODUCTS;
  window.getProductById   = function (id) { return PRODUCTS.find(function (p) { return p.id === id; }) || null; };
  window.renderProducts   = function (opts) { if (opts && opts.category) activeFilters.category = opts.category; applyFilters(); };

  // Init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { applyFilters(); initControls(); });
  } else { applyFilters(); initControls(); }

})();