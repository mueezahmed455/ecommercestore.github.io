/**
 * Internationalization (i18n) Module
 * Multi-language support with inline translation objects.
 * Supports en, es, fr, de.
 */
(function() {
  'use strict';

  var STORAGE_KEY = 'dragon_language';
  var DEFAULT_LANG = 'en';

  // ---- Translation dictionaries ----

  var TRANSLATIONS = {
    en: {
      nav_home: 'Home',
      nav_login: 'Sign In',
      nav_dashboard: 'Dashboard',
      nav_cart: 'Cart',
      nav_signout: 'Sign Out',
      hero_title: '<span class="gradient-text">Technology, Curated</span><br><span>for Excellence</span>',
      hero_subtitle: 'Premium devices and accessories for professionals who demand performance, reliability, and refined design.',
      hero_explore: 'Explore Collection',
      products_title: 'Featured Products',
      search_placeholder: 'Search devices (e.g., \'earbuds\')...',
      filter_all: 'All Categories',
      filter_audio: 'Audio',
      filter_wearable: 'Wearables',
      filter_computers: 'Computers',
      filter_accessories: 'Accessories',
      add_to_cart: 'Add to Cart',
      checkout: 'Checkout',
      cart_title: 'Your Cart',
      cart_empty: 'Your cart is empty',
      cart_total: 'Total',
      footer_text: '&copy; 2026 Dragon-Tech. Premium technology for professionals.',
      login_title: 'Sign In to Your Account',
      login_email: 'Email address',
      login_password: 'Password',
      login_submit: 'Sign In',
      signup_title: 'Create Account',
      signup_name: 'Full Name',
      signup_confirm: 'Confirm Password',
      signup_submit: 'Create Account',
      dashboard_title: 'Your Dashboard',
      total_spent: 'Total Spent',
      orders_count: 'Orders',
      rewards_tier: 'Rewards Tier',
      coupons_title: 'Your Coupons',
      profile_title: 'Profile',
      back_to_store: 'Back to Store',
      continue_shopping: 'Continue Shopping',
      view_dashboard: 'View Dashboard',
      order_confirmation: 'Order Confirmed!',
      order_thankyou: 'Thank you for your purchase. Your order is being processed.',
      order_delivery: 'Estimated Delivery',
      order_id: 'Order ID',
      wishlist_title: 'Your Wishlist',
      move_to_cart: 'Move to Cart',
      recently_viewed: 'Recently Viewed',
      newsletter_placeholder: 'your@email.com',
      newsletter_submit: 'Subscribe',
      announcement_dismiss: 'Dismiss',
      remove_item: 'Remove'
    },
    es: {
      nav_home: 'Inicio',
      nav_login: 'Iniciar Sesi\u00F3n',
      nav_dashboard: 'Panel',
      nav_cart: 'Carrito',
      nav_signout: 'Cerrar Sesi\u00F3n',
      hero_title: 'Tecnolog\u00EDa Premium Reinventada',
      hero_subtitle: 'Dispositivos seleccionados para el minimalista moderno',
      hero_explore: 'Explorar Colecci\u00F3n',
      products_title: 'Explorar la Colecci\u00F3n',
      search_placeholder: 'Buscar dispositivos (ej. \'auriculares\')...',
      filter_all: 'Todas las Categor\u00EDas',
      filter_audio: 'Audio',
      filter_wearable: 'Wearables',
      filter_computers: 'Computadoras',
      filter_accessories: 'Accesorios',
      add_to_cart: 'A\u00F1adir al Carrito',
      checkout: 'Pagar',
      cart_title: 'Tu Carrito',
      cart_empty: 'Tu carrito est\u00E1 vac\u00EDo',
      cart_total: 'Total',
      footer_text: '\u00A9 2026 Dragon-Tech. Creado con precisi\u00F3n.',
      login_title: 'Bienvenido de Nuevo',
      login_email: 'Correo electr\u00F3nico',
      login_password: 'Contrase\u00F1a',
      login_submit: 'Iniciar Sesi\u00F3n',
      signup_title: 'Crear Cuenta',
      signup_name: 'Nombre Completo',
      signup_confirm: 'Confirmar Contrase\u00F1a',
      signup_submit: 'Crear Cuenta',
      dashboard_title: 'Tu Panel',
      total_spent: 'Total Gastado',
      orders_count: 'Pedidos',
      rewards_tier: 'Nivel de Recompensa',
      coupons_title: 'Tus Cupones',
      profile_title: 'Perfil',
      back_to_store: 'Volver a la Tienda',
      continue_shopping: 'Seguir Comprando',
      view_dashboard: 'Ver Panel',
      order_confirmation: '\u00A1Pedido Confirmado!',
      order_thankyou: 'Gracias por tu compra. Tu pedido est\u00E1 siendo procesado.',
      order_delivery: 'Entrega Estimada',
      order_id: 'ID del Pedido',
      wishlist_title: 'Tu Lista de Deseos',
      move_to_cart: 'Mover al Carrito',
      recently_viewed: 'Vistos Recientemente',
      newsletter_placeholder: 'your@email.com',
      newsletter_submit: 'Subscribe',
      announcement_dismiss: 'Dismiss',
      remove_item: 'Remove'
    },
    fr: {
      nav_home: 'Accueil',
      nav_login: 'Connexion',
      nav_dashboard: 'Tableau de Bord',
      nav_cart: 'Panier',
      nav_signout: 'D\u00E9connexion',
      hero_title: 'La Technologie Premium R\u00E9invent\u00E9e',
      hero_subtitle: 'Des appareils s\u00E9lectionn\u00E9s pour le minimaliste moderne',
      hero_explore: 'Explorer la Collection',
      products_title: 'Explorer la Collection',
      search_placeholder: 'Rechercher des appareils (ex.\'\u00E9couteurs\')...',
      filter_all: 'Toutes les Cat\u00E9gories',
      filter_audio: 'Audio',
      filter_wearable: 'Wearables',
      filter_computers: 'Ordinateurs',
      filter_accessories: 'Accessoires',
      add_to_cart: 'Ajouter au Panier',
      checkout: 'Payer',
      cart_title: 'Votre Panier',
      cart_empty: 'Votre panier est vide',
      cart_total: 'Total',
      footer_text: '\u00A9 2026 Dragon-Tech. Cr\u00E9\u00E9 avec pr\u00E9cision.',
      login_title: 'Bienvenue',
      login_email: 'Adresse e-mail',
      login_password: 'Mot de passe',
      login_submit: 'Se Connecter',
      signup_title: 'Cr\u00E9er un Compte',
      signup_name: 'Nom Complet',
      signup_confirm: 'Confirmer le Mot de Passe',
      signup_submit: 'Cr\u00E9er un Compte',
      dashboard_title: 'Votre Tableau de Bord',
      total_spent: 'Total D\u00E9pens\u00E9',
      orders_count: 'Commandes',
      rewards_tier: 'Niveau de R\u00E9compense',
      coupons_title: 'Vos Coupons',
      profile_title: 'Profil',
      back_to_store: 'Retour \u00E0 la Boutique',
      continue_shopping: 'Continuer vos Achats',
      view_dashboard: 'Voir le Tableau de Bord',
      order_confirmation: 'Commande Confirm\u00E9e !',
      order_thankyou: 'Merci pour votre achat. Votre commande est en cours de traitement.',
      order_delivery: 'Livraison Estim\u00E9e',
      order_id: 'ID de Commande',
      wishlist_title: 'Votre Liste de Souhaits',
      move_to_cart: 'D\u00E9placer vers le Panier',
      recently_viewed: 'R\u00E9cemment Consult\u00E9s',
      newsletter_placeholder: 'your@email.com',
      newsletter_submit: 'Subscribe',
      announcement_dismiss: 'Dismiss',
      remove_item: 'Remove'
    },
    de: {
      nav_home: 'Startseite',
      nav_login: 'Anmelden',
      nav_dashboard: '\u00DCbersicht',
      nav_cart: 'Warenkorb',
      nav_signout: 'Abmelden',
      hero_title: 'Premium-Technologie Neu Definiert',
      hero_subtitle: 'Ausgew\u00E4hlte Ger\u00E4te f\u00FCr den modernen Minimalisten',
      hero_explore: 'Kollektion Entdecken',
      products_title: 'Die Kollektion Entdecken',
      search_placeholder: 'Ger\u00E4te suchen (z.B. \'Kopfh\u00F6rer\')...',
      filter_all: 'Alle Kategorien',
      filter_audio: 'Audio',
      filter_wearable: 'Wearables',
      filter_computers: 'Computer',
      filter_accessories: 'Zubeh\u00F6r',
      add_to_cart: 'In den Warenkorb',
      checkout: 'Zur Kasse',
      cart_title: 'Ihr Warenkorb',
      cart_empty: 'Ihr Warenkorb ist leer',
      cart_total: 'Gesamt',
      footer_text: '\u00A9 2026 Dragon-Tech. Mit Pr\u00E4zision gefertigt.',
      login_title: 'Willkommen Zur\u00FCck',
      login_email: 'E-Mail-Adresse',
      login_password: 'Passwort',
      login_submit: 'Anmelden',
      signup_title: 'Konto Erstellen',
      signup_name: 'Vollst\u00E4ndiger Name',
      signup_confirm: 'Passwort Best\u00E4tigen',
      signup_submit: 'Konto Erstellen',
      dashboard_title: 'Ihre \u00DCbersicht',
      total_spent: 'Gesamtausgaben',
      orders_count: 'Bestellungen',
      rewards_tier: 'Belohnungsstufe',
      coupons_title: 'Ihre Gutscheine',
      profile_title: 'Profil',
      back_to_store: 'Zur\u00FCck zum Shop',
      continue_shopping: 'Weiter Einkaufen',
      view_dashboard: '\u00DCbersicht Anzeigen',
      order_confirmation: 'Bestellung Best\u00E4tigt!',
      order_thankyou: 'Vielen Dank f\u00FCr Ihren Einkauf. Ihre Bestellung wird bearbeitet.',
      order_delivery: 'Voraussichtliche Lieferung',
      order_id: 'Bestellnummer',
      wishlist_title: 'Ihre Wunschliste',
      move_to_cart: 'In den Warenkorb Verschieben',
      recently_viewed: 'K\u00FCrzlich Angesehen',
      newsletter_placeholder: 'your@email.com',
      newsletter_submit: 'Subscribe',
      announcement_dismiss: 'Dismiss',
      remove_item: 'Remove'
    }
  };

  // ---- Utilities ----

  function getSelectedLanguage() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored && TRANSLATIONS[stored]) return stored;
    } catch (e) { /* storage unavailable */ }
    return DEFAULT_LANG;
  }

  function persistLanguage(code) {
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch (e) { /* storage unavailable */ }
  }

  /**
   * Set the lang attribute on <html>.
   */
  function setLangAttribute(code) {
    document.documentElement.setAttribute('lang', code);
  }

  // ---- Public API ----

  /**
   * Translate a key. Returns the key itself if not found.
   * @param {string} key - Translation key
   * @param {string} [lang] - Optional language override
   * @returns {string}
   */
  function t(key, lang) {
    var code = lang || getSelectedLanguage();
    var dict = TRANSLATIONS[code];
    if (!dict) return key;
    return dict[key] !== undefined ? dict[key] : key;
  }

  /**
   * Set the active language and update all translatable elements.
   * @param {string} code - Language code (en, es, fr, de)
   */
  function setLanguage(code) {
    if (!TRANSLATIONS[code]) return;
    persistLanguage(code);
    setLangAttribute(code);
    applyTranslations(code);

    if (window.renderProducts) window.renderProducts();
    if (window.cart && window.cart.updateCartUI) window.cart.updateCartUI();

    // Update selector dropdown if present
    var selector = document.getElementById('languageSelector');
    if (selector) selector.value = code;
  }

  /**
   * Get the currently selected language code.
   * @returns {string}
   */
  function getLanguage() {
    return getSelectedLanguage();
  }

  /**
   * Apply translations to all elements with data-i18n or data-i18n-placeholder.
   */
  function applyTranslations(lang) {
    var code = lang || getSelectedLanguage();

    // Text content
    var textEls = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < textEls.length; i++) {
      var key = textEls[i].getAttribute('data-i18n');
      var translated = t(key, code);
      // For inputs/buttons, set value/textContent appropriately
      if (textEls[i].tagName === 'INPUT' && textEls[i].type === 'submit') {
        textEls[i].value = translated;
      } else if (textEls[i].tagName === 'BUTTON' || textEls[i].tagName === 'LABEL') {
        textEls[i].textContent = translated;
      } else {
        textEls[i].innerHTML = translated;
      }
    }

    // Placeholder attributes
    var placeholderEls = document.querySelectorAll('[data-i18n-placeholder]');
    for (var j = 0; j < placeholderEls.length; j++) {
      var pKey = placeholderEls[j].getAttribute('data-i18n-placeholder');
      placeholderEls[j].placeholder = t(pKey, code);
    }
  }

  // ---- Initialize ----

  function init() {
    var code = getSelectedLanguage();
    setLangAttribute(code);
    applyTranslations(code);

    // Set up selector listener
    var selector = document.getElementById('languageSelector');
    if (selector) {
      selector.value = code;
      selector.addEventListener('change', function() {
        setLanguage(selector.value);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose public API
  window.i18n = {
    t: t,
    setLanguage: setLanguage,
    getLanguage: getLanguage,
    applyTranslations: applyTranslations
  };

})();
