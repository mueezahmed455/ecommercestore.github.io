/**
 * Dragon-Tech Auth Module — v2.0
 * Handles login/signup forms with real-time validation,
 * password strength meter, and storage-service integration.
 */
(function () {
  'use strict';

  function $id(id) { return document.getElementById(id); }
  function toast(msg, type) { if (window.utils) window.utils.showToast(msg, type); }

  // ---- Field validation ----
  function setError(fieldId, errId, msg) {
    var field = $id(fieldId);
    var err   = $id(errId);
    if (field) field.classList.toggle('error', !!msg);
    if (err)   err.textContent = msg || '';
  }

  function clearErrors(ids) {
    ids.forEach(function (id) { setError(id, id + 'Error', ''); });
  }

  // ---- Password visibility toggle ----
  function initPasswordToggles() {
    document.querySelectorAll('.pw-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = $id(this.getAttribute('data-target'));
        if (!target) return;
        var show = target.type === 'password';
        target.type = show ? 'text' : 'password';
        this.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
        var svg = this.querySelector('svg');
        if (svg && show) {
          svg.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
        } else if (svg) {
          svg.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
        }
      });
    });
  }

  // ---- Password Strength ----
  function initPasswordStrength(inputId, barsId, labelId) {
    var input = $id(inputId);
    var bars  = $id(barsId);
    var label = $id(labelId);
    if (!input || !bars) return;

    input.addEventListener('input', function () {
      var strength = window.utils ? window.utils.passwordStrength(this.value) : { score: 0, label: '', color: '' };
      var score = strength.score;
      bars.querySelectorAll('.strength-bar').forEach(function (bar, idx) {
        var level = idx < 2 ? 'weak' : idx < 3 ? 'fair' : idx < 4 ? 'good' : 'strong';
        bar.className = 'strength-bar' + (idx < score ? ' ' + level : '');
      });
      if (label) {
        label.textContent = strength.label;
        label.style.color = strength.color;
      }
    });
  }

  // ---- Tab Switching ----
  function initTabs() {
    var tabs = document.querySelectorAll('.auth-tab[data-tab]');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var target = this.getAttribute('data-tab');
        tabs.forEach(function (t) { t.classList.remove('active'); });
        this.classList.add('active');
        document.querySelectorAll('.auth-form').forEach(function (f) {
          f.classList.toggle('active', f.id === target + 'Form');
        });
        // Update URL hash silently
        history.replaceState(null, '', '#' + target);
      });
    });

    // Activate from hash
    var hash = (location.hash || '').replace('#', '');
    if (hash) {
      var tab = document.querySelector('.auth-tab[data-tab="' + hash + '"]');
      if (tab) tab.click();
    }
  }

  // ---- Login Form ----
  function initLoginForm() {
    var form = $id('loginForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors(['loginEmail', 'loginPassword']);

      var email = ($id('loginEmail') || {}).value || '';
      var pw    = ($id('loginPassword') || {}).value || '';
      var btn   = $id('loginSubmit');

      var valid = true;
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('loginEmail', 'loginEmailError', 'Please enter a valid email address');
        valid = false;
      }
      if (!pw) {
        setError('loginPassword', 'loginPasswordError', 'Password is required');
        valid = false;
      }
      if (!valid) return;

      if (btn) btn.classList.add('loading');

      // Small async delay for UX
      setTimeout(function () {
        try {
          var user = window.storage.login(email, pw);
          toast('Welcome back, ' + user.name + '!', 'success');

          // Redirect after short delay
          var params = new URLSearchParams(window.location.search);
          var redirect = params.get('redirect');
          setTimeout(function () {
            if (redirect === 'checkout') {
              window.location.href = '../index.html#checkout';
            } else if (user.role === 'admin') {
              window.location.href = 'admin.html';
            } else {
              window.location.href = 'dashboard.html';
            }
          }, 800);
        } catch (err) {
          if (btn) btn.classList.remove('loading');
          toast(err.message, 'error');
          setError('loginEmail', 'loginEmailError', ' ');
          setError('loginPassword', 'loginPasswordError', err.message);
        }
      }, 400);
    });
  }

  // ---- Signup Form ----
  function initSignupForm() {
    var form = $id('signupForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors(['signupName', 'signupEmail', 'signupPassword', 'signupConfirm']);

      var name    = ($id('signupName')    || {}).value || '';
      var email   = ($id('signupEmail')   || {}).value || '';
      var pw      = ($id('signupPassword')|| {}).value || '';
      var pw2     = ($id('signupConfirm') || {}).value || '';
      var btn     = $id('signupSubmit');
      var valid   = true;

      if (!name || name.trim().length < 2) {
        setError('signupName', 'signupNameError', 'Name must be at least 2 characters');
        valid = false;
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('signupEmail', 'signupEmailError', 'Please enter a valid email address');
        valid = false;
      }
      if (!pw || pw.length < 8) {
        setError('signupPassword', 'signupPasswordError', 'Password must be at least 8 characters');
        valid = false;
      }
      if (pw !== pw2) {
        setError('signupConfirm', 'signupConfirmError', 'Passwords do not match');
        valid = false;
      }
      if (!valid) return;

      if (btn) btn.classList.add('loading');

      setTimeout(function () {
        try {
          var user = window.storage.signup(name, email, pw);
          toast('Account created! Welcome, ' + user.name + '!', 'success');
          setTimeout(function () { window.location.href = 'dashboard.html'; }, 800);
        } catch (err) {
          if (btn) btn.classList.remove('loading');
          toast(err.message, 'error');
          if (err.message.includes('email')) {
            setError('signupEmail', 'signupEmailError', err.message);
          }
        }
      }, 400);
    });
  }

  // ---- Init ----
  function init() {
    // Redirect if already logged in
    if (window.storage && window.storage.getCurrentUser()) {
      var user = window.storage.getCurrentUser();
      window.location.href = user.role === 'admin' ? 'admin.html' : 'dashboard.html';
      return;
    }

    initTabs();
    initLoginForm();
    initSignupForm();
    initPasswordToggles();
    initPasswordStrength('signupPassword', 'strengthBars', 'strengthLabel');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }

})();
