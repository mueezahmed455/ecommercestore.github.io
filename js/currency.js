/**
 * Multi-Currency Price Display Module
 * Supports USD, EUR, GBP, JPY with hardcoded defaults overridable from Firestore.
 */
(function() {
  'use strict';

  var STORAGE_KEY = 'dragon_currency';
  var DEFAULT_CURRENCY = 'USD';

  var CURRENCIES = {
    USD: { symbol: '$', rate: 1 },
    EUR: { symbol: '\u20AC', rate: 0.85 },
    GBP: { symbol: '\u00A3', rate: 0.73 },
    JPY: { symbol: '\u00A5', rate: 110 }
  };

  var loadedRates = false;

  // ---- Utilities ----

  function getSelectedCurrency() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored && CURRENCIES[stored]) return stored;
    } catch (e) { /* storage unavailable */ }
    return DEFAULT_CURRENCY;
  }

  function persistCurrency(code) {
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch (e) { /* storage unavailable */ }
  }

  /**
   * Format a number according to currency conventions.
   * JPY has no decimals; others use 2 decimal places.
   */
  function formatAmount(convertedAmount, code) {
    var currency = CURRENCIES[code];
    if (code === 'JPY') {
      return currency.symbol + Math.round(convertedAmount).toLocaleString('en-US');
    }
    return currency.symbol + convertedAmount.toFixed(2);
  }

  /**
   * Load exchange rates from Firestore settings/exchangeRates
   * and merge them into CURRENCIES. Runs once.
   */
  async function loadRatesFromFirestore() {
    if (loadedRates) return;
    loadedRates = true;

    if (!window.db || !window.db.firestore) return;

    try {
      var fbFirestore = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
      var settingsRef = fbFirestore.doc(window.db.firestore, 'settings', 'exchangeRates');
      var snap = await fbFirestore.getDoc(settingsRef);

      if (snap.exists()) {
        var data = snap.data();
        var codes = ['USD', 'EUR', 'GBP', 'JPY'];
        for (var i = 0; i < codes.length; i++) {
          var code = codes[i];
          if (data[code] !== undefined && !isNaN(data[code]) && data[code] > 0) {
            CURRENCIES[code].rate = Number(data[code]);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load exchange rates from Firestore, using defaults:', error);
    }
  }

  // ---- Public API ----

  /**
   * Convert a USD amount to the selected currency and format it.
   * @param {number} amountInUSD - Price in USD
   * @returns {string} Formatted price string
   */
  function formatPrice(amountInUSD) {
    var code = getSelectedCurrency();
    var currency = CURRENCIES[code];
    var converted = amountInUSD * currency.rate;
    return formatAmount(converted, code);
  }

  /**
   * Set the active currency, persist it, and re-render all prices.
   * @param {string} code - Currency code (USD, EUR, GBP, JPY)
   */
  function setCurrency(code) {
    if (!CURRENCIES[code]) return;
    persistCurrency(code);
    renderPrices();

    if (window.cart && window.cart.updateCartUI) window.cart.updateCartUI();

    // Update selector dropdown if present
    var selector = document.getElementById('currencySelector');
    if (selector) selector.value = code;
  }

  /**
   * Get the currently selected currency code.
   * @returns {string}
   */
  function getCurrency() {
    return getSelectedCurrency();
  }

  /**
   * Get the current exchange rates object (for debugging/inspection).
   * @returns {object}
   */
  function getRates() {
    var result = {};
    var codes = ['USD', 'EUR', 'GBP', 'JPY'];
    for (var i = 0; i < codes.length; i++) {
      result[codes[i]] = CURRENCIES[codes[i]].rate;
    }
    return result;
  }

  /**
   * Re-render all elements with class "price-display".
   * Each element must have a data-price-usd attribute
   * containing the original USD price.
   */
  function renderPrices() {
    var els = document.querySelectorAll('.price-display');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var usdPrice = parseFloat(el.getAttribute('data-price-usd'));
      if (!isNaN(usdPrice)) {
        el.textContent = formatPrice(usdPrice);
      }
    }
  }

  // ---- Initialize ----

  function init() {
    var code = getSelectedCurrency();

    // Set up selector listener
    var selector = document.getElementById('currencySelector');
    if (selector) {
      selector.value = code;
      selector.addEventListener('change', function() {
        setCurrency(selector.value);
      });
    }

    // Load rates from Firestore, then render prices
    loadRatesFromFirestore().then(function() {
      renderPrices();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose public API
  window.currency = {
    formatPrice: formatPrice,
    setCurrency: setCurrency,
    getCurrency: getCurrency,
    getRates: getRates,
    renderPrices: renderPrices
  };

})();
