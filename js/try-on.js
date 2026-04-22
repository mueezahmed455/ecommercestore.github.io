(function() {
  'use strict';

  var VirtualTryOn = {
    TRY_ON_CATEGORIES: ['wearable', 'audio'],
    isActive: false,
    stream: null,

    init: function() {
      this.checkSupport();
      this.createWidget();
    },

    checkSupport: function() {
      this.isSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    },

    createWidget: function() {
      var widget = document.createElement('div');
      widget.id = 'tryOnWidget';
      widget.className = 'try-on-widget';
      widget.innerHTML =
        '<button class="try-on-toggle" aria-label="Virtual Try-On">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
            '<circle cx="12" cy="12" r="10"/>' +
            '<path d="M8 14s1.5 2 4 2 4-2 4-2"/>' +
            '<line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>' +
          '</svg>' +
          '<span>Try On</span>' +
        '</button>' +
        '<div class="try-on-panel">' +
          '<div class="try-on-header">' +
            '<h3>Virtual Try-On</h3>' +
            '<button class="try-on-close">&times;</button>' +
          '</div>' +
          '<div class="try-on-content">' +
            '<div class="try-on-preview" id="tryOnPreview">' +
              '<video id="tryOnVideo" autoplay playsinline></video>' +
              '<canvas id="tryOnCanvas"></canvas>' +
              '<div class="try-on-overlay"></div>' +
            '</div>' +
            '<div class="try-on-products" id="tryOnProducts">' +
              '<p>Select a product to try on:</p>' +
            '</div>' +
          '</div>' +
          '<div class="try-on-hint">' +
            '<p>Point your face to try on glasses, watches & more</p>' +
          '</div>' +
        '</div>';
      document.body.appendChild(widget);
      this.bindEvents(widget);
    },

    bindEvents: function(widget) {
      var toggle = widget.querySelector('.try-on-toggle');
      var panel = widget.querySelector('.try-on-panel');
      var close = widget.querySelector('.try-on-close');

      if (toggle) toggle.addEventListener('click', function() {
        panel.classList.toggle('open');
        if (panel.classList.contains('open') && VirtualTryOn.isSupported) {
          VirtualTryOn.startCamera();
          VirtualTryOn.loadProducts();
        }
      });

      if (close) close.addEventListener('click', function() {
        panel.classList.remove('open');
        VirtualTryOn.stopCamera();
      });
    },

    startCamera: function() {
      var video = document.getElementById('tryOnVideo');
      if (!this.isSupported || !video) return;

      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
        .then(function(stream) {
          VirtualTryOn.stream = stream;
          video.srcObject = stream;
          VirtualTryOn.startTracking();
        })
        .catch(function() {
          console.log('Camera access denied');
        });
    },

    stopCamera: function() {
      var video = document.getElementById('tryOnVideo');
      if (this.stream) {
        this.stream.getTracks().forEach(function(t) { t.stop(); });
        this.stream = null;
      }
      if (video) video.srcObject = null;
    },

    startTracking: function() {
      var canvas = document.getElementById('tryOnCanvas');
      var video = document.getElementById('tryOnVideo');
      if (!canvas || !video) return;

      var ctx = canvas.getContext('2d');
      var self = this;

      function render() {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0);

          if (self.selectedProduct) {
            self.renderAROverlay(ctx, canvas.width, canvas.height);
          }
        }
        requestAnimationFrame(render);
      }
      render();
    },

    renderAROverlay: function(ctx, width, height) {
      var product = this.selectedProduct;
      if (!product) return;

      var centerX = width / 2;
      var y = product.category === 'wearable' ? height * 0.2 : height * 0.35;

      ctx.globalAlpha = 0.8;
      ctx.font = 'bold 24px Inter';

      if (product.category === 'wearable') {
        ctx.fillStyle = product.badge === 'new' ? '#00a8ff' : '#ff6b6b';
        ctx.fillRect(centerX - 80, y - 15, 160, 30);
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText(product.name.split(' ')[0], centerX, y + 5);
      } else {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath();
        ctx.arc(centerX, y, 50, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#00ffd4';
        ctx.fillText('🎧', centerX - 10, y + 8);
      }

      ctx.globalAlpha = 1;
    },

    loadProducts: function() {
      var container = document.getElementById('tryOnProducts');
      if (!container || !window.PRODUCTS) return;

      var tryOnProducts = window.PRODUCTS.filter(function(p) {
        return VirtualTryOn.TRY_ON_CATEGORIES.includes(p.category);
      });

      container.innerHTML = '<p>Select a product to try on:</p>' +
        tryOnProducts.map(function(p) {
          return '<div class="try-on-product" data-id="' + p.id + '">' +
            '<img src="' + p.image + '" alt="' + p.name + '">' +
            '<span>' + p.name + '</span>' +
          '</div>';
        }).join('');

      container.querySelectorAll('.try-on-product').forEach(function(el) {
        el.addEventListener('click', function() {
          var id = el.dataset.id;
          var product = window.getProductById ? window.getProductById(id) : null;
          VirtualTryOn.selectedProduct = product;
          container.querySelectorAll('.try-on-product').forEach(function(p) { p.classList.remove('active'); });
          el.classList.add('active');
        });
      });
    },

    isSupported: false,
    selectedProduct: null
  };

  window.VirtualTryOn = VirtualTryOn;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { VirtualTryOn.init(); });
  } else { VirtualTryOn.init(); }

})();