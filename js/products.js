/**
 * Product Catalog — Dragon-Tech
 * 16 curated tech products with SVG illustrations.
 */
(function() {
  'use strict';

  var PRODUCTS = [
    {
      id: 'mystery-box',
      name: 'Dragon\'s Mystery Hoard #042',
      price: 49.00,
      image: 'assets/dragon-logo.png',
      category: 'accessories',
      description: 'A guaranteed $100+ value tech bundle including at least 1 rare/premium accessory. Final sale.',
      rating: 5.0,
      reviewsCount: 128
    },
    {
      id: "prod_001",
      name: "DragonBuds Pro",
      description: "Active noise cancellation, 36h battery, spatial audio with dragon sound",
      price: 79.99,
      image: "assets/product-earbuds.svg",
      category: "audio"
    },
    {
      id: "prod_002",
      name: "Wyrm Watch",
      description: "Sapphire crystal, titanium case, always-on dragon display",
      price: 49.99,
      image: "assets/product-watch.svg",
      category: "wearable"
    },
    {
      id: "prod_003",
      name: "DrakeBook Ultra",
      description: "M-series chip, 16GB RAM, 512GB SSD, 14\" Retina display",
      price: 129.99,
      image: "assets/product-laptop.svg",
      category: "computers"
    },
    {
      id: "prod_004",
      name: "Dragon Voice",
      description: "360\u00b0 sound, voice assistant, multi-room audio with bass boost",
      price: 39.99,
      image: "assets/product-speaker.svg",
      category: "audio"
    },
    {
      id: "prod_005",
      name: "Claw Keyboard",
      description: "Hot-swappable switches, RGB, CNC aluminum frame",
      price: 59.99,
      image: "assets/product-keyboard.svg",
      category: "accessories"
    },
    {
      id: "prod_006",
      name: "FireCell 20K",
      description: "20,000mAh, USB-C PD 65W, charges laptops on the go",
      price: 24.99,
      image: "assets/product-charger.svg",
      category: "accessories"
    },
    {
      id: "prod_007",
      name: "ScaleCam 4K",
      description: "Auto-focus, dual mic array, HDR with low-light correction",
      price: 44.99,
      image: "assets/product-webcam.svg",
      category: "accessories"
    },
    {
      id: "prod_008",
      name: "Pulse Band",
      description: "Heart rate, SpO2, sleep tracking, 14-day battery life",
      price: 34.99,
      image: "assets/product-fitness.svg",
      category: "wearable"
    },
    {
      id: "prod_009",
      name: "Ignis Mouse",
      description: "25K DPI sensor, 70g ultralight, customizable RGB zones",
      price: 44.99,
      image: "assets/product-mouse.svg",
      category: "accessories"
    },
    {
      id: "prod_010",
      name: "Horizon 34\"",
      description: "Ultra-wide curved WQHD, 165Hz, 1ms response, HDR600",
      price: 149.99,
      image: "assets/product-monitor.svg",
      category: "computers"
    },
    {
      id: "prod_011",
      name: "Roar Headset",
      description: "50mm drivers, detachable mic, 60h wireless battery",
      price: 54.99,
      image: "assets/product-headset.svg",
      category: "audio"
    },
    {
      id: "prod_012",
      name: "Slate Pro 11\"",
      description: "OLED display, stylus included, 12GB RAM, all-day battery",
      price: 89.99,
      image: "assets/product-tablet.svg",
      category: "computers"
    },
    {
      id: "prod_013",
      name: "Nexus Hub",
      description: "8-in-1 USB-C dock: HDMI 4K, Ethernet, 3\u00d7 USB-A, SD, PD",
      price: 29.99,
      image: "assets/product-usb.svg",
      category: "accessories"
    },
    {
      id: "prod_014",
      name: "Drake Mic",
      description: "Condenser capsule, cardioid pattern, zero-latency monitoring",
      price: 64.99,
      image: "assets/product-mic.svg",
      category: "audio"
    },
    {
      id: "prod_015",
      name: "Hoard SSD 1TB",
      description: "NVMe portable, 1050MB/s read, USB 3.2 Gen 2, aluminum",
      price: 39.99,
      image: "assets/product-ssd.svg",
      category: "accessories"
    },
    {
      id: "prod_016",
      name: "Lair Mesh WiFi",
      description: "Tri-band WiFi 6E, covers 6000 sq ft, AI mesh routing",
      price: 74.99,
      image: "assets/product-router.svg",
      category: "accessories"
    }
  ];

  /**
   * Escape HTML to prevent XSS
   */
  

  /**
   * Get product by ID
   */
  function getProductById(id) {
    return PRODUCTS.find(function(p) { return p.id === id; });
  }

  /**
   * Render products to the grid
   */
  function renderProducts(filteredProducts) {
    var grid = document.getElementById('productsGrid');
    if (!grid) return;

    var items = filteredProducts || PRODUCTS;

    if (items.length === 0) {
      grid.innerHTML = '<p class="empty-state" style="grid-column:1/-1">No products found matching your search.</p>';
      return;
    }

    grid.innerHTML = items.map(function(product, index) {
      return '<article class="product-card glass reveal stagger-' + ((index % 8) + 1) + '" role="listitem" aria-label="' + escapeHtml(product.name) + '">' +
        '<div class="product-image">' +
          '<img src="' + product.image + '" alt="' + escapeHtml(product.name) + '" loading="lazy">' +
        '</div>' +
        '<div class="product-info">' +
          '<h3 class="product-name">' + escapeHtml(product.name) + '</h3>' +
          '<p class="product-description">' + escapeHtml(product.description) + '</p>' +
          '<div class="product-footer">' +
            '<span class="product-price price-display" data-price-usd="' + product.price + '">' + (window.currency ? window.currency.formatPrice(product.price) : '$' + product.price.toFixed(2)) + '</span>' +
            '<button class="add-to-cart-btn ripple" data-product-id="' + product.id + '" data-i18n="add_to_cart" aria-label="Add ' + escapeHtml(product.name) + ' to cart">' +
              (window.i18n ? window.i18n.t('add_to_cart') : 'Add to Cart') +
            '</button>' +
          '</div>' +
        '</div>' +
      '</article>';
    }).join('');

    // Attach event listeners
    grid.querySelectorAll('.add-to-cart-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        var productId = e.target.dataset.productId;
        if (window.cart && window.cart.addToCart) {
          window.cart.addToCart(productId);
        }
      });
    });

    // Trigger scroll reveal
    initScrollReveal();
  }

  /**
   * Filter products by search term and category
   */
  function filterProducts() {
    var searchTerm = (document.getElementById('searchInput') || {}).value || '';
    var category = (document.getElementById('categoryFilter') || {}).value || 'all';

    var term = searchTerm.toLowerCase().trim();

    var filtered = PRODUCTS.filter(function(product) {
      var matchesSearch = !term ||
        product.name.toLowerCase().indexOf(term) !== -1 ||
        product.description.toLowerCase().indexOf(term) !== -1 ||
        product.category.toLowerCase().indexOf(term) !== -1;
      var matchesCategory = category === 'all' || product.category === category;
      return matchesSearch && matchesCategory;
    });

    renderProducts(filtered);
  }

  /**
   * Init search and filter event listeners
   */
  function initDiscoveryControls() {
    var searchInput = document.getElementById('searchInput');
    var categoryFilter = document.getElementById('categoryFilter');

    if (searchInput) {
      searchInput.addEventListener('input', debounce(filterProducts, 200));
    }

    if (categoryFilter) {
      categoryFilter.addEventListener('change', filterProducts);
    }
  }

  /**
   * Debounce helper
   */
  function debounce(fn, delay) {
    var timer;
    return function() {
      var args = arguments;
      var ctx = this;
      clearTimeout(timer);
      timer = setTimeout(function() { fn.apply(ctx, args); }, delay);
    };
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
      threshold: 0.05,
      rootMargin: '0px 0px -30px 0px'
    });

    document.querySelectorAll('.reveal').forEach(function(el) {
      observer.observe(el);
    });
  }

  // Expose globally
  window.getProductById = getProductById;
  window.renderProducts = filterProducts;

  // Initialize on DOM ready
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
