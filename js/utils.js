(function() {
  'use strict';

  window.utils = {
    escapeHtml: function(unsafe) {
      if (!unsafe) return '';
      return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    },
    showToast: function(message, type) {
      var toast = document.getElementById('toast');
      if (!toast) {
        console.log('[' + (type || 'info') + '] ' + message);
        return;
      }
      toast.textContent = message;
      toast.className = 'toast ' + (type || 'info');
      toast.classList.add('show');
      setTimeout(function() { toast.classList.remove('show'); }, 3000);
    },
    formatCurrency: function(amount) {
      if (window.currency && window.currency.formatPrice) {
        return window.currency.formatPrice(amount);
      }
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    }
  };

  // Expose to window for legacy support across modules
  window.escapeHtml = window.utils.escapeHtml;
  window.showToast = window.utils.showToast;
  window.formatCurrency = window.utils.formatCurrency;

})();
