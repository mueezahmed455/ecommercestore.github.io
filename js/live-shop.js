(function() {
  'use strict';

  var LiveShop = {
    sessionId: null,
    participants: [],
    isHost: false,

    init: function() {
      this.sessionId = this.generateSessionId();
      this.createWidget();
    },

    generateSessionId: function() {
      return 'session_' + Math.random().toString(36).substr(2, 9);
    },

    createWidget: function() {
      var widget = document.createElement('div');
      widget.id = 'liveShopWidget';
      widget.className = 'live-shop-widget';
      widget.innerHTML =
        '<button class="live-toggle" aria-label="Live Co-Shopping">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
            '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>' +
            '<circle cx="9" cy="7" r="4"/>' +
            '<path d="M23 21v-2a4 4 0 0 0-3-3.87"/>' +
            '<path d="M16 3.13a4 4 0 0 1 0 7.75"/>' +
          '</svg>' +
          '<span class="live-badge">0</span>' +
        '</button>' +
        '<div class="live-panel">' +
          '<div class="live-header">' +
            '<h3>Live Co-Shopping</h3>' +
            '<button class="live-close">&times;</button>' +
          '</div>' +
          '<div class="live-content">' +
            '<div class="live-status">' +
              '<span class="live-dot"></span>' +
              '<span>Start or join a session</span>' +
            '</div>' +
            '<div class="live-actions">' +
              '<button class="btn btn-primary btn-sm" id="liveStartBtn">Create Session</button>' +
              '<button class="btn btn-outline btn-sm" id="liveJoinBtn">Join Session</button>' +
            '</div>' +
            '<div class="live-session" style="display:none;">' +
              '<div class="live-code">Code: <strong id="liveSessionCode"></strong></div>' +
              '<button class="btn btn-outline btn-sm" id="liveCopyBtn">Copy</button>' +
              '<button class="btn btn-outline btn-sm" id="liveLeaveBtn">Leave</button>' +
            '</div>' +
            '<div class="live-chat" id="liveChat"></div>' +
            '<div class="live-input-wrap">' +
              '<input type="text" id="liveMessage" placeholder="Type a message...">' +
              '<button id="liveSendBtn">Send</button>' +
            '</div>' +
          '</div>' +
          '<div class="live-participants">' +
            '<p>Participants: <span id="liveCount">0</span></p>' +
          '</div>' +
        '</div>';
      document.body.appendChild(widget);
      this.bindEvents(widget);
    },

    bindEvents: function(widget) {
      var toggle = widget.querySelector('.live-toggle');
      var panel = widget.querySelector('.live-panel');
      var close = widget.querySelector('.live-close');
      var startBtn = widget.querySelector('#liveStartBtn');
      var joinBtn = widget.querySelector('#liveJoinBtn');
      var copyBtn = widget.querySelector('#liveCopyBtn');
      var leaveBtn = widget.querySelector('#liveLeaveBtn');
      var sendBtn = widget.querySelector('#liveSendBtn');

      if (toggle) toggle.addEventListener('click', function() {
        panel.classList.toggle('open');
      });

      if (close) close.addEventListener('click', function() {
        panel.classList.remove('open');
      });

      if (startBtn) startBtn.addEventListener('click', function() {
        LiveShop.startSession();
      });

      if (joinBtn) joinBtn.addEventListener('click', function() {
        var code = prompt('Enter session code:');
        if (code) LiveShop.joinSession(code);
      });

      if (copyBtn) copyBtn.addEventListener('click', function() {
        var code = document.getElementById('liveSessionCode');
        if (code) {
          navigator.clipboard.writeText(code.textContent);
          if (window.utils) window.utils.showToast('Code copied!', 'success');
        }
      });

      if (leaveBtn) leaveBtn.addEventListener('click', function() {
        LiveShop.leaveSession();
      });

      if (sendBtn) sendBtn.addEventListener('click', function() {
        LiveShop.sendMessage();
      });
    },

    startSession: function() {
      this.isHost = true;
      var code = this.sessionId.split('_')[1].toUpperCase();
      this.showSession(code);
      this.addMessage('System', 'Session started. Share the code with friends!');
      this.updateParticipantCount(1);
    },

    joinSession: function(code) {
      this.isHost = false;
      this.showSession(code);
      this.addMessage('System', 'Joined session');
      this.simulateParticipants();
    },

    showSession: function(code) {
      var session = document.querySelector('.live-session');
      var codeEl = document.getElementById('liveSessionCode');
      if (session && codeEl) {
        session.style.display = '';
        codeEl.textContent = code;
      }
    },

    leaveSession: function() {
      var session = document.querySelector('.live-session');
      if (session) session.style.display = 'none';
      this.participants = [];
      this.updateParticipantCount(0);
    },

    simulateParticipants: function() {
      var count = Math.floor(Math.random() * 3) + 1;
      this.updateParticipantCount(count);
    },

    sendMessage: function() {
      var input = document.getElementById('liveMessage');
      if (!input || !input.value.trim()) return;

      this.addMessage('You', input.value);
      input.value = '';

      if (!this.isHost && Math.random() > 0.5) {
        setTimeout(function() {
          var responses = ['Looks great!', 'What do you think?', 'Nice find!', 'I recommend it'];
          var resp = responses[Math.floor(Math.random() * responses.length)];
          LiveShop.addMessage('Friend', resp);
        }, 2000);
      }
    },

    addMessage: function(sender, text) {
      var chat = document.getElementById('liveChat');
      if (!chat) return;

      var msg = document.createElement('div');
      msg.className = 'live-msg';
      msg.innerHTML = '<strong>' + sender + ':</strong> ' + text;
      chat.appendChild(msg);
      chat.scrollTop = chat.scrollHeight;
    },

    updateParticipantCount: function(count) {
      this.participants = count;
      var badge = document.querySelector('.live-badge');
      var countEl = document.getElementById('liveCount');
      if (badge) badge.textContent = count;
      if (countEl) countEl.textContent = count;
    }
  };

  window.LiveShop = LiveShop;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { LiveShop.init(); });
  } else { LiveShop.init(); }

})();