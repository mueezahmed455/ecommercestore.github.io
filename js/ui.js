/**
 * Shared UI Module
 * Cart sidebar, accessibility controls, scroll progress, hero particles, toasts
 */
(function() {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUI);
  } else {
    initUI();
  }

  /**
   * Initialize all UI components
   */
  function initUI() {
    initCartSidebar();
    initAccessibility();
    initCheckout();
    initScrollProgress();
    initNavbarScroll();
    initHeroParticles();
  }

  /**
   * Cart sidebar open/close logic
   */
  function initCartSidebar() {
    var cartBtn = document.getElementById('cartBtn');
    var cartSidebar = document.getElementById('cartSidebar');
    var cartOverlay = document.getElementById('cartOverlay');
    var closeCart = document.getElementById('closeCart');

    function openCart() {
      if (cartSidebar) {
        cartSidebar.classList.add('open');
        cartSidebar.setAttribute('aria-hidden', 'false');
      }
      if (cartOverlay) cartOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeCartSidebar() {
      if (cartSidebar) {
        cartSidebar.classList.remove('open');
        cartSidebar.setAttribute('aria-hidden', 'true');
      }
      if (cartOverlay) cartOverlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    if (cartBtn) cartBtn.addEventListener('click', openCart);
    if (closeCart) closeCart.addEventListener('click', closeCartSidebar);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCartSidebar);

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && cartSidebar && cartSidebar.classList.contains('open')) {
        closeCartSidebar();
      }
    });
  }

  /**
   * Accessibility controls (contrast toggle, font size toggle)
   */
  function initAccessibility() {
    var contrastToggle = document.getElementById('contrastToggle');
    var fontToggle = document.getElementById('fontToggle');

    // Restore saved preferences
    if (localStorage.getItem('highContrast') === 'true') {
      document.body.classList.add('high-contrast');
    }

    if (localStorage.getItem('largeFont') === 'true') {
      document.body.classList.add('large-font');
    }

    // Contrast toggle
    if (contrastToggle) {
      contrastToggle.addEventListener('click', function() {
        document.body.classList.toggle('high-contrast');
        var isActive = document.body.classList.contains('high-contrast');
        localStorage.setItem('highContrast', isActive);
        contrastToggle.setAttribute('aria-pressed', isActive);
      });
    }

    // Font size toggle
    if (fontToggle) {
      fontToggle.addEventListener('click', function() {
        document.body.classList.toggle('large-font');
        var isActive = document.body.classList.contains('large-font');
        localStorage.setItem('largeFont', isActive);
        fontToggle.setAttribute('aria-pressed', isActive);
      });
    }
  }

  /**
   * Checkout button handler
   */
  function initCheckout() {
    var checkoutBtn = document.getElementById('checkoutBtn');
    if (!checkoutBtn) return;

    checkoutBtn.addEventListener('click', function() {
      if (window.cart && window.cart.processCheckout) {
        window.cart.processCheckout();
      }
    });
  }

  /**
   * Scroll progress indicator
   */
  function initScrollProgress() {
    var progressBar = document.getElementById('scrollProgress');
    if (!progressBar) return;

    window.addEventListener('scroll', function() {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      var scrollPercent = scrollTop / docHeight;
      progressBar.style.transform = 'scaleX(' + scrollPercent + ')';
    }, { passive: true });
  }

  /**
   * Navbar shadow on scroll
   */
  function initNavbarScroll() {
    var navbar = document.querySelector('.navbar');
    if (!navbar) return;

    window.addEventListener('scroll', function() {
      if (window.scrollY > 10) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  /**
   * Hero floating particles
   */
  function initHeroParticles() {
    var container = document.getElementById('heroParticles');
    if (!container) return;

    var colors = ['#00d4ff', '#a855f7', '#ec4899', '#22c55e'];
    var count = window.innerWidth < 768 ? 15 : 30;

    for (var i = 0; i < count; i++) {
      var particle = document.createElement('div');
      particle.className = 'particle';
      var size = Math.random() * 4 + 1;
      var color = colors[Math.floor(Math.random() * colors.length)];
      var left = Math.random() * 100;
      var duration = Math.random() * 15 + 10;
      var delay = Math.random() * 15;
      var opacity = Math.random() * 0.4 + 0.1;

      particle.style.cssText =
        'width:' + size + 'px;' +
        'height:' + size + 'px;' +
        'background:' + color + ';' +
        'left:' + left + '%;' +
        'animation-duration:' + duration + 's;' +
        'animation-delay:' + delay + 's;' +
        'opacity:' + opacity + ';';

      container.appendChild(particle);
    }
  }

  /**
   * Global toast notification
   */
  
})();
