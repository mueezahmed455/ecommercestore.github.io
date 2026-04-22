(function() {
  'use strict';

  var VisualSearch = {
    isSupported: false,
    fileInput: null,

    init: function() {
      this.checkSupport();
      this.createWidget();
    },

    checkSupport: function() {
      this.isSupported = !!(document.createElement('input').type === 'file' && 
        (window.FileReader || window.Image));
    },

    createWidget: function() {
      var widget = document.createElement('div');
      widget.id = 'visualSearchWidget';
      widget.className = 'visual-search-widget';
      widget.innerHTML =
        '<button class="visual-search-toggle" aria-label="Visual Search">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
            '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>' +
            '<circle cx="8.5" cy="8.5" r="1.5"/>' +
            '<polyline points="21 15 16 10 5 21"/>' +
          '</svg>' +
          '<span>Image Search</span>' +
        '</button>' +
        '<div class="visual-search-panel">' +
          '<div class="visual-search-header">' +
            '<h3>Search by Image</h3>' +
            '<p>Upload a photo to find similar products</p>' +
            '<button class="visual-search-close">&times;</button>' +
          '</div>' +
          '<div class="visual-search-content">' +
            '<div class="visual-search-drop" id="visualSearchDrop">' +
              '<input type="file" id="visualSearchInput" accept="image/*" hidden>' +
              '<div class="drop-icon">' +
                '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' +
                  '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>' +
                  '<circle cx="8.5" cy="8.5" r="1.5"/>' +
                  '<polyline points="21 15 16 10 5 21"/>' +
                '</svg>' +
              '</div>' +
              '<p>Drop an image or click to upload</p>' +
              '<span class="drop-hint">Supports JPG, PNG, WebP</span>' +
            '</div>' +
            '<div class="visual-search-preview" id="visualSearchPreview" style="display:none;">' +
              '<img id="visualSearchImage" src="" alt="Search image">' +
              '<button class="preview-clear" id="visualSearchClear">&times;</button>' +
            '</div>' +
            '<div class="visual-search-results" id="visualSearchResults"></div>' +
          '</div>' +
        '</div>';
      document.body.appendChild(widget);
      this.bindEvents(widget);
    },

    bindEvents: function(widget) {
      var toggle = widget.querySelector('.visual-search-toggle');
      var panel = widget.querySelector('.visual-search-panel');
      var close = widget.querySelector('.visual-search-close');
      var drop = widget.querySelector('.visual-search-drop');
      var input = widget.querySelector('#visualSearchInput');
      var clear = widget.querySelector('#visualSearchClear');

      if (toggle) toggle.addEventListener('click', function() {
        panel.classList.toggle('open');
      });

      if (close) close.addEventListener('click', function() {
        panel.classList.remove('open');
      });

      if (drop) drop.addEventListener('click', function() {
        if (input) input.click();
      });

      if (input) input.addEventListener('change', function(e) {
        if (e.target.files.length) {
          VisualSearch.processImage(e.target.files[0]);
        }
      });

      if (drop) {
        drop.addEventListener('dragover', function(e) {
          e.preventDefault();
          drop.classList.add('dragover');
        });

        drop.addEventListener('dragleave', function() {
          drop.classList.remove('dragover');
        });

        drop.addEventListener('drop', function(e) {
          e.preventDefault();
          drop.classList.remove('dragover');
          if (e.dataTransfer.files.length) {
            VisualSearch.processImage(e.dataTransfer.files[0]);
          }
        });
      }

      if (clear) clear.addEventListener('click', function() {
        VisualSearch.clearSearch();
      });
    },

    processImage: function(file) {
      if (!file.type.startsWith('image/')) return;

      var reader = new FileReader();
      reader.onload = function(e) {
        VisualSearch.showPreview(e.target.result);
        VisualSearch.findSimilar(e.target.result);
      };
      reader.readAsDataURL(file);
    },

    showPreview: function(src) {
      var drop = document.getElementById('visualSearchDrop');
      var preview = document.getElementById('visualSearchPreview');
      var image = document.getElementById('visualSearchImage');

      if (drop) drop.style.display = 'none';
      if (preview && image) {
        image.src = src;
        preview.style.display = '';
      }
    },

    findSimilar: function(imageSrc) {
      var results = document.getElementById('visualSearchResults');
      if (!results || !window.PRODUCTS) return;

      results.innerHTML = '<div class="searching">Searching for similar products...</div>';

      setTimeout(function() {
        var similar = VisualSearch.simulateMatching();

        var fmt = window.currency ? window.currency.formatPrice : function(p) { return '$' + p.toFixed(2); };

        if (!similar.length) {
          results.innerHTML = '<p>No similar products found</p>';
          return;
        }

        results.innerHTML = similar.map(function(p) {
          return '<div class="similar-product" data-id="' + p.id + '">' +
            '<img src="' + p.image + '" alt="' + p.name + '">' +
            '<div class="similar-name">' + p.name + '</div>' +
            '<div class="similar-price">' + fmt(p.salePrice || p.price) + '</div>' +
            '<div class="similar-match">' + Math.floor(Math.random() * 20 + 75) + '% match</div>' +
          '</div>';
        }).join('');

        results.querySelectorAll('.similar-product').forEach(function(el) {
          el.addEventListener('click', function() {
            if (window.openProductModal) window.openProductModal(el.dataset.id);
          });
        });
      }, 1500);
    },

    simulateMatching: function() {
      if (!window.PRODUCTS) return [];
      var shuffled = window.PRODUCTS.slice().sort(function() { return 0.5 - Math.random(); });
      return shuffled.slice(0, 4);
    },

    clearSearch: function() {
      var drop = document.getElementById('visualSearchDrop');
      var preview = document.getElementById('visualSearchPreview');
      var results = document.getElementById('visualSearchResults');
      var input = document.getElementById('visualSearchInput');

      if (drop) drop.style.display = '';
      if (preview) preview.style.display = 'none';
      if (results) results.innerHTML = '';
      if (input) input.value = '';
    }
  };

  window.VisualSearch = VisualSearch;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { VisualSearch.init(); });
  } else { VisualSearch.init(); }

})();