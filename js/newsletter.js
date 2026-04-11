/**
 * Newsletter Subscription Module
 * Captures email subscriptions and writes to Firestore subscribers collection.
 * Exposes window.newsletter.
 */
(function() {
  'use strict';

  var FORM_ID = 'newsletterForm';
  var EMAIL_INPUT_ID = 'newsletterEmail';
  var FIRESTORE_MODULE_URL = 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

  // ---- Utility helpers ----

  function isValidEmail(email) {
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

   

  function getFirestoreFunctions() {
    return import(FIRESTORE_MODULE_URL).then(function(m) {
      return {
        collection: m.collection,
        doc: m.doc,
        addDoc: m.addDoc,
        query: m.query,
        where: m.where,
        getDocs: m.getDocs,
        serverTimestamp: m.serverTimestamp
      };
    });
  }

  // ---- Firestore operations ----

  async function isAlreadySubscribed(email) {
    var fb = await getFirestoreFunctions();
    var subscribersRef = fb.collection(window.db.firestore, 'subscribers');
    var q = fb.query(subscribersRef, fb.where('email', '==', email.toLowerCase()), fb.where('active', '==', true));
    var snapshot = await fb.getDocs(q);
    return !snapshot.empty;
  }

  async function subscribe(email) {
    if (!email) throw new Error('Email is required');
    if (!isValidEmail(email)) throw new Error('Please enter a valid email address');

    var alreadySubscribed = await isAlreadySubscribed(email);
    if (alreadySubscribed) {
      throw new Error('You are already subscribed to the newsletter');
    }

    var fb = await getFirestoreFunctions();
    var subscribersRef = fb.collection(window.db.firestore, 'subscribers');

    await fb.addDoc(subscribersRef, {
      email: email.toLowerCase().trim(),
      subscribedAt: fb.serverTimestamp(),
      active: true
    });
  }

  // Note: HTML is already in index.html, no need to overwrite.

  // ---- Event handlers ----

  function handleFormSubmit() {
    var form = document.getElementById(FORM_ID);
    var emailInput = document.getElementById(EMAIL_INPUT_ID);
    
    // Create error element since it doesn't exist in index.html
    var errorEl = document.getElementById('newsletterError');
    if (!errorEl && form) {
      errorEl = document.createElement('span');
      errorEl.id = 'newsletterError';
      errorEl.className = 'newsletter-error text-danger';
      errorEl.style.display = 'none';
      form.appendChild(errorEl);
    }
    
    var submitBtn = form ? form.querySelector('[type="submit"]') : null;

    if (!form || !emailInput) return;

    form.addEventListener('submit', async function(e) {
      e.preventDefault();

      var email = emailInput.value.trim();

      // Clear previous errors
      if (errorEl) errorEl.style.display = 'none';
      emailInput.classList.remove('input-error');

      // Validate email
      if (!email) {
        showError('Email address is required');
        return;
      }

      if (!isValidEmail(email)) {
        showError('Please enter a valid email address');
        return;
      }

      // Disable button during submission
      submitBtn.disabled = true;
      submitBtn.textContent = 'Subscribing...';

      try {
        await subscribe(email);

        showToast('Subscribed successfully! Check your inbox.', 'success');
        emailInput.value = '';
        form.reset();
      } catch (error) {
        console.error('Newsletter subscription failed:', error);

        if (error.message && error.message.indexOf('already subscribed') !== -1) {
          showError('This email is already subscribed');
          showToast('You are already subscribed!', 'info');
        } else {
          showError(error.message || 'Failed to subscribe. Please try again.');
          showToast('Subscription failed. Please try again.', 'error');
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Subscribe';
      }
    });

    // Clear error on input
    emailInput.addEventListener('input', function() {
      if (errorEl) errorEl.style.display = 'none';
      emailInput.classList.remove('input-error');
    });
  }

  function showError(message) {
    var errorEl = document.getElementById('newsletterError');
    var emailInput = document.getElementById(EMAIL_INPUT_ID);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }
    if (emailInput) {
      emailInput.classList.add('input-error');
    }
  }

  // ---- Initialize ----

  function init() {
    handleFormSubmit();
  }

  // ---- Public API ----

  window.newsletter = {
    subscribe: subscribe,
    isAlreadySubscribed: isAlreadySubscribed,
    isValidEmail: isValidEmail
  };

  // ---- Self-initialize on DOMContentLoaded ----

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      var form = document.getElementById(FORM_ID);
      if (form) {
        init();
      }
    });
  } else {
    var form = document.getElementById(FORM_ID);
    if (form) {
      init();
    }
  }

})();
