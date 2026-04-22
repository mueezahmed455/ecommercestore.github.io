/**
 * Dragon-Tech Multi-Currency Module — v2.0 (Local-Only)
 * Live exchange rates from a public API with localStorage fallback.
 * Exposes window.currency
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'dt_currency';
  var RATES_KEY   = 'dt_exchange_rates';
  var DEFAULT     = 'USD';

  var CURRENCIES = {
    USD: { symbol: '$',  code: 'USD', name: 'US Dollar',        rate: 1      },
    GBP: { symbol: '£',  code: 'GBP', name: 'British Pound',    rate: 0.79   },
    EUR: { symbol: '€',  code: 'EUR', name: 'Euro',             rate: 0.92   },
    JPY: { symbol: '¥',  code: 'JPY', name: 'Japanese Yen',     rate: 154.50 },
    CAD: { symbol: 'C$', code: 'CAD', name: 'Canadian Dollar',  rate: 1.36   },
    AUD: { symbol: 'A$', code: 'AUD', name: 'Australian Dollar',rate: 1.55   }
  };

  // Attempt to fetch live rates from a free public API (no key needed)
  function fetchLiveRates() {
    return fetch('https://open.er-api.com/v6/latest/USD')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && data.rates) {
          Object.keys(CURRENCIES).forEach(function (code) {
            if (data.rates[code]) CURRENCIES[code].rate = data.rates[code];
          });
          try {
            localStorage.setItem(RATES_KEY, JSON.stringify({
              rates: Object.fromEntries(Object.entries(CURRENCIES).map(function (e) { return [e[0], e[1].rate]; })),
              ts: Date.now()
            }));
          } catch (e) {}
        }
      })
      .catch(function () {
        // Load cached rates if network fails
        try {
          var cached = JSON.parse(localStorage.getItem(RATES_KEY) || 'null');
          if (cached && cached.rates) {
            Object.keys(cached.rates).forEach(function (c) {
              if (CURRENCIES[c]) CURRENCIES[c].rate = cached.rates[c];
            });
          }
        } catch (e) {}
      });
  }

  function getSelected() {
    try {
      var s = localStorage.getItem(STORAGE_KEY);
      if (s && CURRENCIES[s]) return s;
    } catch (e) {}
    return DEFAULT;
  }

  function formatPrice(amountUSD) {
    var code = getSelected();
    var cur  = CURRENCIES[code];
    var val  = amountUSD * cur.rate;
    if (code === 'JPY') return cur.symbol + Math.round(val).toLocaleString('en-US');
    return cur.symbol + val.toFixed(2);
  }

  function setCurrency(code) {
    if (!CURRENCIES[code]) return;
    try { localStorage.setItem(STORAGE_KEY, code); } catch (e) {}

    // Re-render all static price elements
    document.querySelectorAll('.price-display[data-price-usd]').forEach(function (el) {
      var usd = parseFloat(el.getAttribute('data-price-usd'));
      if (!isNaN(usd)) el.textContent = formatPrice(usd);
    });

    // Sync all currency selectors on the page
    document.querySelectorAll('.currency-sync').forEach(function (sel) {
      sel.value = code;
    });

    // Refresh dynamic UIs
    if (window.cart && window.cart.updateCartUI) window.cart.updateCartUI();
    if (window.renderProducts) window.renderProducts();

    window.dispatchEvent(new CustomEvent('currency-change', { detail: code }));
  }

  function getCurrency() { return getSelected(); }

  function init() {
    var sel = document.querySelectorAll('.currency-sync');
    sel.forEach(function (el) {
      el.value = getSelected();
      el.addEventListener('change', function () { setCurrency(this.value); });
    });

    // Also wire any element with id="currencySelector" (navbar)
    var navSel = document.getElementById('currencySelector');
    if (navSel) {
      navSel.classList.add('currency-sync');
      navSel.value = getSelected();
      navSel.addEventListener('change', function () { setCurrency(this.value); });
    }

    // Fetch live rates (non-blocking)
    fetchLiveRates().then(function () {
      document.querySelectorAll('.price-display[data-price-usd]').forEach(function (el) {
        var usd = parseFloat(el.getAttribute('data-price-usd'));
        if (!isNaN(usd)) el.textContent = formatPrice(usd);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }

  window.currency = {
    formatPrice: formatPrice,
    setCurrency: setCurrency,
    getCurrency: getCurrency,
    currencies:  CURRENCIES
  };

})();
