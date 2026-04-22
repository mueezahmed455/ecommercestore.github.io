(function() {
  'use strict';

  var ARPreview = {
    isSupported: false,
    container: null,
    currentProduct: null,

    init: function() {
      this.isSupported = this.checkSupport();
      this.createWidget();
    },

    checkSupport: function() {
      return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    },

    createWidget: function() {
      var widget = document.createElement('div');
      widget.id = 'arPreviewWidget';
      widget.className = 'ar-widget';
      widget.innerHTML =
        '<button class="ar-toggle" aria-label="Toggle AR Preview">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
            '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>' +
          '</svg>' +
          <span>AR Preview</span>' +
        '</button>' +
        '<div class="ar-panel">' +
          '<div class="ar-header">' +
            '<h3>AR Preview</h3>' +
            '<button class="ar-close">&times;</button>' +
          '</div>' +
          '<div class="ar-content">' +
            '<p class="ar-status">Point your camera at a flat surface</p>' +
            '<video id="arVideo" autoplay playsinline></video>' +
            '<canvas id="arCanvas"></canvas>' +
            '<div class="ar-overlay"></div>' +
          '</div>' +
          '<p class="ar-hint">Not supported on this device</p>' +
        '</div>';
      document.body.appendChild(widget);
      this.bindEvents(widget);
    },

    bindEvents: function(widget) {
      var toggle = widget.querySelector('.ar-toggle');
      var panel = widget.querySelector('.ar-panel');
      var close = widget.querySelector('.ar-close');

      if (toggle) toggle.addEventListener('click', function() {
        panel.classList.toggle('open');
        if (panel.classList.contains('open') && ARPreview.isSupported) {
          ARPreview.startCamera();
        }
      });

      if (close) close.addEventListener('click', function() {
        panel.classList.remove('open');
        ARPreview.stopCamera();
      });
    },

    startCamera: function() {
      var video = document.getElementById('arVideo');
      if (!video || !this.isSupported) return;

      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(function(stream) {
          video.srcObject = stream;
        })
        .catch(function() {
          console.log('AR not supported');
        });
    },

    stopCamera: function() {
      var video = document.getElementById('arVideo');
      if (video && video.srcObject) {
        video.srcObject.getTracks().forEach(function(t) { t.stop(); });
      }
    },

    showProduct: function(product) {
      this.currentProduct = product;
      if (this.isSupported) {
        this.renderProduct3D(product);
      }
    },

    renderProduct3D: function(product) {
      var canvas = document.getElementById('arCanvas');
      if (!canvas || !product) return;

      var ctx = canvas.getContext('2d');
      var video = document.getElementById('arVideo');

      function render() {
        if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
        requestAnimationFrame(render);
      }
      render();
    }
  };

  window.ARPreview = ARPreview;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { ARPreview.init(); });
  } else { ARPreview.init(); }

})();