/**
 * Dragon-Tech Newsletter Module — v2.0 (Local-Only)
 */
(function () {
  'use strict';

  function init() {
    var form    = document.getElementById('newsletterForm');
    var emailEl = document.getElementById('newsletterEmail');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = (emailEl || {}).value || '';
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (window.utils) window.utils.showToast('Please enter a valid email address', 'error');
        return;
      }

      var btn = form.querySelector('button[type=submit]');
      if (btn) btn.classList.add('loading');

      try {
        if (window.storage && window.storage.addSubscriber) {
          window.storage.addSubscriber(email);
          if (window.utils) window.utils.showToast('🎉 Subscribed! Welcome to Dragon-Tech updates.', 'success');
          if (emailEl) emailEl.value = '';
        }
      } catch (err) {
        var msg = err.message === 'already_subscribed'
          ? 'You\'re already subscribed — thanks!'
          : err.message;
        if (window.utils) window.utils.showToast(msg, err.message === 'already_subscribed' ? 'info' : 'error');
      }

      if (btn) btn.classList.remove('loading');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }

})();
