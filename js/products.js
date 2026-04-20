/**
 * Dragon-Tech Product Catalog
 * Complete product catalog with images
 */
(function() {
  'use strict';

  var PRODUCTS = [
    // Audio
    {
      id: 'prod_001',
      name: 'Wireless Earbuds Pro',
      description: 'Premium active noise cancellation, 36-hour battery life, spatial audio',
      price: 79.99,
      salePrice: 59.99,
      image: 'assets/product-earbuds.svg',
      category: 'audio',
      rating: 4.7,
      reviewsCount: 234,
      badge: 'sale',
      inStock: true
    },
    {
      id: 'prod_002',
      name: 'Smart Bluetooth Speaker',
      description: '360-degree sound, voice assistant, multi-room audio with bass boost',
      price: 49.99,
      salePrice: null,
      image: 'assets/product-speaker.svg',
      category: 'audio',
      rating: 4.5,
      reviewsCount: 156,
      badge: null,
      inStock: true
    },
    {
      id: 'prod_003',
      name: 'Pro Gaming Headset',
      description: '50mm drivers, detachable mic, 60-hour wireless battery',
      price: 59.99,
      salePrice: 44.99,
      image: 'assets/product-headset.svg',
      category: 'audio',
      rating: 4.6,
      reviewsCount: 189,
      badge: 'sale',
      inStock: true
    },
    {
      id: 'prod_004',
      name: 'USB Microphone',
      description: 'Condenser capsule, cardioid pattern, zero-latency monitoring',
      price: 69.99,
      salePrice: null,
      image: 'assets/product-mic.svg',
      category: 'audio',
      rating: 4.8,
      reviewsCount: 98,
      badge: null,
      inStock: true
    },
    // Wearables
    {
      id: 'prod_005',
      name: 'Smart Watch Ultra',
      description: 'Sapphire crystal, titanium case, always-on display, 7-day battery',
      price: 299.99,
      salePrice: 249.99,
      image: 'assets/product-watch.svg',
      category: 'wearable',
      rating: 4.8,
      reviewsCount: 312,
      badge: 'sale',
      inStock: true
    },
    {
      id: 'prod_006',
      name: 'Fitness Band Pro',
      description: 'Heart rate, SpO2, sleep tracking, 14-day battery life',
      price: 49.99,
      salePrice: null,
      image: 'assets/product-fitness.svg',
      category: 'wearable',
      rating: 4.4,
      reviewsCount: 178,
      badge: null,
      inStock: true
    },
    // Computers
    {
      id: 'prod_007',
      name: 'Ultrabook Pro 15"',
      description: 'M3 chip, 16GB RAM, 512GB SSD, 15" Retina display',
      price: 1299.99,
      salePrice: 1099.99,
      image: 'assets/product-laptop.svg',
      category: 'computers',
      rating: 4.9,
      reviewsCount: 156,
      badge: 'sale',
      inStock: true
    },
    {
      id: 'prod_008',
      name: 'Ultra Monitor 34"',
      description: 'Ultra-wide curved WQHD, 165Hz, 1ms response, HDR600',
      price: 499.99,
      salePrice: 399.99,
      image: 'assets/product-monitor.svg',
      category: 'computers',
      rating: 4.7,
      reviewsCount: 89,
      badge: 'sale',
      inStock: true
    },
    {
      id: 'prod_009',
      name: 'Pro Tablet 11"',
      description: 'OLED display, stylus included, 12GB RAM, all-day battery',
      price: 599.99,
      salePrice: null,
      image: 'assets/product-tablet.svg',
      category: 'computers',
      rating: 4.6,
      reviewsCount: 134,
      badge: 'new',
      inStock: true
    },
    // Accessories
    {
      id: 'prod_010',
      name: 'Mechanical Keyboard',
      description: 'Hot-swappable switches, RGB backlight, aluminum frame',
      price: 89.99,
      salePrice: 69.99,
      image: 'assets/product-keyboard.svg',
      category: 'accessories',
      rating: 4.7,
      reviewsCount: 267,
      badge: 'sale',
      inStock: true
    },
    {
      id: 'prod_011',
      name: 'Wireless Gaming Mouse',
      description: '25K DPI sensor, 70g ultralight, programmable RGB zones',
      price: 59.99,
      salePrice: null,
      image: 'assets/product-mouse.svg',
      category: 'accessories',
      rating: 4.6,
      reviewsCount: 198,
      badge: null,
      inStock: true
    },
    {
      id: 'prod_012',
      name: 'Power Bank 20000mAh',
      description: '20,000mAh, USB-C PD 65W, fast charging',
      price: 39.99,
      salePrice: null,
      image: 'assets/product-charger.svg',
      category: 'accessories',
      rating: 4.5,
      reviewsCount: 423,
      badge: 'bestseller',
      inStock: true
    },
    {
      id: 'prod_013',
      name: '4K Webcam Pro',
      description: 'Auto-focus, dual mic array, HDR with low-light correction',
      price: 79.99,
      salePrice: 59.99,
      image: 'assets/product-webcam.svg',
      category: 'accessories',
      rating: 4.4,
      reviewsCount: 145,
      badge: 'sale',
      inStock: true
    },
    {
      id: 'prod_014',
      name: 'USB-C Hub 8-in-1',
      description: 'USB-C dock: HDMI 4K, Ethernet, 3x USB-A, SD card, PD',
      price: 49.99,
      salePrice: null,
      image: 'assets/product-usb.svg',
      category: 'accessories',
      rating: 4.6,
      reviewsCount: 312,
      badge: null,
      inStock: true
    },
    {
      id: 'prod_015',
      name: 'Portable SSD 1TB',
      description: 'NVMe portable, 1050MB/s read, USB 3.2 Gen 2, aluminum',
      price: 99.99,
      salePrice: 79.99,
      image: 'assets/product-ssd.svg',
      category: 'accessories',
      rating: 4.8,
      reviewsCount: 456,
      badge: 'sale',
      inStock: true
    },
    {
      id: 'prod_016',
      name: 'Mesh WiFi System',
      description: 'Tri-band WiFi 6E, covers 6000 sq ft, AI mesh routing',
      price: 299.99,
      salePrice: null,
      image: 'assets/product-router.svg',
      category: 'accessories',
      rating: 4.5,
      reviewsCount: 89,
      badge: 'new',
      inStock: true
    },
    // Bundle
    {
      id: 'bundle_001',
      name: 'Audio Starter Pack',
      description: 'Earbuds + Speaker + Microphone - Save 25%',
      price: 199.97,
      salePrice: 149.99,
      image: 'assets/product-earbuds.svg',
      category: 'bundles',
      rating: 4.8,
      reviewsCount: 67,
      badge: 'sale',
      inStock: true
    },
    {
      id: 'bundle_002',
      name: 'Work From Home Kit',
      description: 'Laptop + Webcam + Microphone - Save 20%',
      price: 1449.97,
      salePrice: 1199.99,
      image: 'assets/product-laptop.svg',
      category: 'bundles',
      rating: 4.9,
      reviewsCount: 45,
      badge: 'bestseller',
      inStock: true
    },
    {
      id: 'bundle_003',
      name: 'Gaming Setup',
      description: 'Monitor + Headset + Keyboard - Save 22%',
      price: 649.97,
      salePrice: 499.99,
      image: 'assets/product-monitor.svg',
      category: 'bundles',
      rating: 4.7,
      reviewsCount: 34,
      badge: 'sale',
      inStock: true
    }
  ];

  // Badge labels
  var BADGE_STYLES = {
    'sale': { bg: '#dc3545', text: 'SALE' },
    'new': { bg: '#0066cc', text: 'NEW' },
    'bestseller': { bg: '#fd7e14', text: 'BEST' },
    'exclusive': { bg: '#6f42c1', text: 'EXCLUSIVE' }
  };

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function formatPrice(price) {
    return '$' + price.toFixed(2);
  }

  function getBadgeHtml(badge) {
    if (!badge || !BADGE_STYLES[badge]) return '';
    var style = BADGE_STYLES[badge];
    return '<span class="product-badge" style="background:' + style.bg + '; color:white; font-size:0.65rem; font-weight:700; padding:3px 8px; border-radius:4px; text-transform:uppercase; position:absolute; top:12px; left:12px; z-index:3;">' + style.text + '</span>';
  }

  function getProductById(id) {
    return PRODUCTS.filter(function(p) { return p.id === id; })[0];
  }

  function renderProducts(filteredProducts) {
    var grid = document.getElementById('productsGrid');
    if (!grid) return;

    var items = filteredProducts || PRODUCTS;

    if (items.length === 0) {
      grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:var(--text-muted); padding:2rem;">No products found</p>';
      return;
    }

    grid.innerHTML = items.map(function(product) {
      var currentPrice = product.salePrice || product.price;
      var originalPrice = product.salePrice ? product.price : null;
      var discount = product.salePrice ? Math.round((1 - product.salePrice / product.price) * 100) : 0;

      return '<article class="product-card" style="position:relative;">' +
        getBadgeHtml(product.badge) +
        '<div class="product-image">' +
          '<img src="' + product.image + '" alt="' + escapeHtml(product.name) + '" loading="lazy">' +
        '</div>' +
        '<div class="product-info">' +
          '<h3 class="product-name">' + escapeHtml(product.name) + '</h3>' +
          '<p class="product-description">' + escapeHtml(product.description) + '</p>' +
          '<div class="product-footer">' +
            '<div>' +
              '<span class="product-price">' + formatPrice(currentPrice) + '</span>' +
              (originalPrice ? '<span class="product-original-price">' + formatPrice(originalPrice) + '</span>' : '') +
              (discount > 0 ? '<span class="discount-badge">-' + discount + '%</span>' : '') +
            '</div>' +
            '<button class="add-to-cart-btn" data-id="' + product.id + '">Add to Cart</button>' +
          '</div>' +
        '</div>' +
      '</article>';
    }).join('');

    // Add to cart event listeners
    grid.querySelectorAll('.add-to-cart-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var productId = this.dataset.id;
        if (window.cart && window.cart.addToCart) {
          window.cart.addToCart(productId);
        }
      });
    });
  }

  function filterProducts() {
    var searchTerm = (document.getElementById('searchInput') || {}).value || '';
    var category = (document.getElementById('categoryFilter') || {}).value || 'all';
    var sortBy = (document.getElementById('sortFilter') || {}).value || 'default';

    var term = searchTerm.toLowerCase().trim();

    var filtered = PRODUCTS.filter(function(product) {
      var matchesSearch = !term ||
        product.name.toLowerCase().indexOf(term) !== -1 ||
        product.description.toLowerCase().indexOf(term) !== -1;
      var matchesCategory = category === 'all' || product.category === category;
      return matchesSearch && matchesCategory;
    });

    // Sort
    if (sortBy === 'price-low') {
      filtered.sort(function(a, b) { return (a.salePrice || a.price) - (b.salePrice || b.price); });
    } else if (sortBy === 'price-high') {
      filtered.sort(function(a, b) { return (b.salePrice || b.price) - (a.salePrice || a.price); });
    } else if (sortBy === 'rating') {
      filtered.sort(function(a, b) { return (b.rating || 0) - (a.rating || 0); });
    }

    renderProducts(filtered);
  }

  function initDiscoveryControls() {
    var searchInput = document.getElementById('searchInput');
    var categoryFilter = document.getElementById('categoryFilter');
    var sortFilter = document.getElementById('sortFilter');

    if (searchInput) {
      searchInput.addEventListener('input', function() {
        clearTimeout(window.searchTimer);
        window.searchTimer = setTimeout(filterProducts, 300);
      });
    }

    if (categoryFilter) {
      categoryFilter.addEventListener('change', filterProducts);
    }

    if (sortFilter) {
      sortFilter.addEventListener('change', filterProducts);
    }
  }

  // Export globally
  window.PRODUCTS = PRODUCTS;
  window.getProductById = getProductById;
  window.renderProducts = filterProducts;

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      renderProducts();
      initDiscoveryControls();
    });
  } else {
    renderProducts();
    initDiscoveryControls();
  }

})();