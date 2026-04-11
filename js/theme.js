/**
 * Theme Toggle Module
 * Dark/light theme with localStorage persistence and system preference fallback.
 * Sets data-theme attribute on <html>; CSS handles actual color changes.
 */
(function() {
  'use strict';

  var STORAGE_KEY = 'dragon_theme';
  var DEFAULT_THEME = 'dark';

  /**
   * Determine the initial theme:
   * 1. localStorage value (if set)
   * 2. prefers-color-scheme system preference
   * 3. fallback to 'dark'
   */
  function resolveInitialTheme() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') return stored;
    } catch (e) { /* storage unavailable */ }

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }

    return DEFAULT_THEME;
  }

  /**
   * Apply a theme by setting data-theme on <html>.
   */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  /**
   * Update the toggle button icon:
   * moon icon when in dark theme (clicking switches to light)
   * sun icon when in light theme (clicking switches to dark)
   */
  function updateToggleIcon(theme) {
    var btn = document.getElementById('themeToggle');
    if (!btn) return;

    if (theme === 'dark') {
      btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
        '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>' +
        '</svg>';
      btn.setAttribute('aria-label', 'Switch to light theme');
      btn.setAttribute('title', 'Switch to light theme');
    } else {
      btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
        '<circle cx="12" cy="12" r="5"/>' +
        '<line x1="12" y1="1" x2="12" y2="3"/>' +
        '<line x1="12" y1="21" x2="12" y2="23"/>' +
        '<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>' +
        '<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>' +
        '<line x1="1" y1="12" x2="3" y2="12"/>' +
        '<line x1="21" y1="12" x2="23" y2="12"/>' +
        '<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>' +
        '<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>' +
        '</svg>';
      btn.setAttribute('aria-label', 'Switch to dark theme');
      btn.setAttribute('title', 'Switch to dark theme');
    }
  }

  /**
   * Persist the theme to localStorage.
   */
  function persistTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) { /* storage unavailable */ }
  }

  // ---- Public API ----

  /**
   * Set the theme explicitly.
   * @param {string} theme - 'dark' or 'light'
   */
  function setTheme(theme) {
    if (theme !== 'dark' && theme !== 'light') return;
    applyTheme(theme);
    updateToggleIcon(theme);
    persistTheme(theme);
  }

  /**
   * Get the current theme.
   * @returns {string}
   */
  function getTheme() {
    return document.documentElement.getAttribute('data-theme') || DEFAULT_THEME;
  }

  /**
   * Toggle between dark and light.
   */
  function toggle() {
    var current = getTheme();
    var next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }

  // ---- Initialize ----

  function init() {
    var theme = resolveInitialTheme();
    applyTheme(theme);
    updateToggleIcon(theme);
    persistTheme(theme);

    var btn = document.getElementById('themeToggle');
    if (btn) {
      btn.addEventListener('click', toggle);
    }

    // Listen for system preference changes (only when user hasn't explicitly set a preference)
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
        try {
          if (!localStorage.getItem(STORAGE_KEY)) {
            var systemTheme = e.matches ? 'dark' : 'light';
            applyTheme(systemTheme);
            updateToggleIcon(systemTheme);
          }
        } catch (ex) { /* storage unavailable */ }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose public API
  window.theme = {
    setTheme: setTheme,
    getTheme: getTheme,
    toggle: toggle
  };

})();
