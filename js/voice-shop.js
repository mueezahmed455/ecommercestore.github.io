(function() {
  'use strict';

  var VoiceShop = {
    recognition: null,
    isListening: false,
    commands: {},

    init: function() {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.log('Voice not supported');
        return;
      }

      var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.commands = {
        'search': this.handleSearch.bind(this),
        'add to cart': this.handleAddToCart.bind(this),
        'add': this.handleAddToCart.bind(this),
        'wishlist': this.handleWishlist.bind(this),
        'show': this.handleShow.bind(this),
        'go to': this.handleNavigate.bind(this),
        'open': this.handleNavigate.bind(this),
        'find': this.handleSearch.bind(this)
      };

      this.createWidget();
      this.bindEvents();
    },

    createWidget: function() {
      var widget = document.createElement('div');
      widget.id = 'voiceShopWidget';
      widget.className = 'voice-widget';
      widget.innerHTML =
        '<button class="voice-toggle" aria-label="Voice Search">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
            '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>' +
            '<path d="M19 10v2a7 7 0 0 1-14 0v-2"/>' +
            '<line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>' +
          '</svg>' +
        '</button>' +
        '<div class="voice-panel">' +
          '<div class="voice-header">' +
            '<h3>Voice Assistant</h3>' +
            '<button class="voice-close">&times;</button>' +
          '</div>' +
          '<div class="voice-status">' +
            '<div class="voice-icon">' +
              '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' +
                '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>' +
                '<path d="M19 10v2a7 7 0 0 1-14 0v-2"/>' +
              '</svg>' +
            '</div>' +
            '<p class="voice-prompt">Tap to speak</p>' +
            '<p class="voice-transcript"></p>' +
          '</div>' +
          '<div class="voice-commands">' +
            '<p>Try saying:</p>' +
            <ul>' +
              '<li>"Search for headphones"</li>' +
              '<li>"Add to cart"</li>' +
              '<li>"Go to wishlist"</li>' +
            '</ul>' +
          '</div>' +
        '</div>';
      document.body.appendChild(widget);
    },

    bindEvents: function() {
      var widget = document.getElementById('voiceShopWidget');
      if (!widget) return;

      var toggle = widget.querySelector('.voice-toggle');
      var panel = widget.querySelector('.voice-panel');
      var close = widget.querySelector('.voice-close');

      if (toggle) toggle.addEventListener('click', function() {
        panel.classList.toggle('open');
        if (panel.classList.contains('open')) {
          VoiceShop.startListening();
        }
      });

      if (close) close.addEventListener('click', function() {
        panel.classList.remove('open');
        VoiceShop.stopListening();
      });

      var self = this;
      this.recognition.onresult = function(event) {
        var transcript = event.results[0][0].transcript.toLowerCase();
        self.handleCommand(transcript);
      };

      this.recognition.onend = function() {
        self.isListening = false;
        self.updateStatus('');
      };

      this.recognition.onerror = function(event) {
        console.log('Voice error:', event.error);
        self.isListening = false;
      };
    },

    startListening: function() {
      if (this.isListening) return;
      try {
        this.recognition.start();
        this.isListening = true;
        this.updateStatus('Listening...');
      } catch(e) {}
    },

    stopListening: function() {
      if (!this.isListening) return;
      this.recognition.stop();
      this.isListening = false;
    },

    handleCommand: function(transcript) {
      this.updateTranscript(transcript);

      for (var cmd in this.commands) {
        if (transcript.includes(cmd)) {
          this.commands[cmd](transcript);
          return;
        }
      }

      this.handleSearch(transcript);
    },

    handleSearch: function(transcript) {
      var searchTerm = transcript.replace(/^(search|find|for)/, '').trim();
      var input = document.getElementById('searchInput');
      if (input) {
        input.value = searchTerm;
        input.dispatchEvent(new Event('input'));
      }
      this.updateStatus('Searching for: ' + searchTerm);
    },

    handleAddToCart: function(transcript) {
      var productMatch = transcript.match(/(?:add|add to cart)\s+(.+)/);
      if (productMatch && window.PRODUCTS) {
        var term = productMatch[1].toLowerCase();
        var product = window.PRODUCTS.find(function(p) {
          return p.name.toLowerCase().includes(term);
        });
        if (product && window.cart) {
          window.cart.addToCart(product.id);
          this.updateStatus('Added ' + product.name + ' to cart');
        }
      }
    },

    handleWishlist: function(transcript) {
      var wishlistBtn = document.getElementById('wishlistBtn');
      if (wishlistBtn) wishlistBtn.click();
      this.updateStatus('Opened wishlist');
    },

    handleShow: function(transcript) {
      this.handleSearch(transcript.replace(/^show/, '').trim());
    },

    handleNavigate: function(transcript) {
      var dest = transcript.replace(/^(go to|open)/, '').trim();
      if (dest.includes('cart')) {
        var cartBtn = document.getElementById('cartBtn');
        if (cartBtn) cartBtn.click();
      } else if (dest.includes('wishlist')) {
        var wishlistBtn = document.getElementById('wishlistBtn');
        if (wishlistBtn) wishlistBtn.click();
      }
    },

    updateStatus: function(text) {
      var widget = document.getElementById('voiceShopWidget');
      if (!widget) return;
      var prompt = widget.querySelector('.voice-prompt');
      if (prompt) prompt.textContent = text || 'Tap to speak';
    },

    updateTranscript: function(text) {
      var widget = document.getElementById('voiceShopWidget');
      if (!widget) return;
      var transcript = widget.querySelector('.voice-transcript');
      if (transcript) transcript.textContent = text;
    }
  };

  window.VoiceShop = VoiceShop;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { VoiceShop.init(); });
  } else { VoiceShop.init(); }

})();