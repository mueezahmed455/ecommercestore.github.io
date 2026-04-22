/**
 * Dragon-Tech Utilities — v2.0 (Local-Only)
 * Shared helpers: escape, toast, date, debounce, validators
 */
(function () {
  'use strict';

  // ---- HTML Escape ----
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ---- Toast Notification (stack-based) ----
  function showToast(message, type) {
    type = type || 'info';
    var stack = document.getElementById('toastStack');
    if (!stack) {
      // Fallback for pages that don't have a toast stack
      var legacy = document.getElementById('toast');
      if (legacy) {
        legacy.textContent = message;
        legacy.className = 'toast toast-' + type + ' show';
        setTimeout(function () { legacy.classList.remove('show'); }, 3500);
      }
      return;
    }

    var icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };

    var el = document.createElement('div');
    el.className = 'toast toast-' + type;
    el.setAttribute('role', 'status');
    el.innerHTML =
      '<div class="toast-icon">' + (icons[type] || 'ℹ') + '</div>' +
      '<div class="toast-body"><div class="toast-msg">' + escapeHtml(message) + '</div></div>';

    stack.appendChild(el);

    var timeout = setTimeout(function () { removeToast(el); }, 4000);
    el.addEventListener('click', function () { clearTimeout(timeout); removeToast(el); });

    function removeToast(t) {
      t.classList.add('out');
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 350);
    }
  }

  // ---- Debounce ----
  function debounce(fn, delay) {
    var timer;
    return function () {
      var args = arguments;
      var ctx = this;
      clearTimeout(timer);
      timer = setTimeout(function () { fn.apply(ctx, args); }, delay);
    };
  }

  // ---- Format Date ----
  function formatDate(ts, opts) {
    if (!ts) return '—';
    var d = ts instanceof Date ? ts : new Date(ts);
    return d.toLocaleDateString('en-US', opts || { year: 'numeric', month: 'short', day: 'numeric' });
  }

  // ---- Email validator ----
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // ---- Password strength ----
  function passwordStrength(pw) {
    if (!pw) return { score: 0, label: '', color: '' };
    var score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    var map = [
      { label: '', color: '' },
      { label: 'Weak', color: '#ff4444' },
      { label: 'Fair', color: '#ffbf24' },
      { label: 'Good', color: '#00a8ff' },
      { label: 'Strong', color: '#00c97b' },
      { label: 'Very Strong', color: '#00ffd4' }
    ];
    return { score: score, label: map[score].label, color: map[score].color };
  }

  // ---- Generate unique ID ----
  function uid(prefix) {
    return (prefix || 'id') + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
  }

  // ---- Render Stars (read-only) ----
  function renderStars(rating, color) {
    rating = Math.round(rating || 0);
    color = color || '#fbbf24';
    var html = '';
    for (var i = 1; i <= 5; i++) {
      html += '<span style="color:' + (i <= rating ? color : 'rgba(255,255,255,0.2)') + ';font-size:0.85rem;">★</span>';
    }
    return html;
  }

  // ---- Format currency shorthand ----
  function formatCurrency(amount) {
    if (window.currency && window.currency.formatPrice) {
      return window.currency.formatPrice(amount);
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }

  // ---- Public API ----
  window.utils = {
    escapeHtml: escapeHtml,
    showToast: showToast,
    debounce: debounce,
    formatDate: formatDate,
    isValidEmail: isValidEmail,
    passwordStrength: passwordStrength,
    uid: uid,
    renderStars: renderStars,
    formatCurrency: formatCurrency
  };

  // Legacy compat
  window.escapeHtml = escapeHtml;
  window.showToast = showToast;
  window.formatCurrency = formatCurrency;

})();
