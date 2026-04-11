/**
 * Authentication Module
 * Handles signup, login, logout with Firebase Auth
 * Includes input validation and XSS protection
 */
(function() {
  'use strict';

  // DOM Elements
  var loginForm = document.getElementById('loginForm');
  var signupForm = document.getElementById('signupForm');
  var loginTab = document.getElementById('loginTab');
  var signupTab = document.getElementById('signupTab');

  // Initialize if on auth page
  if (loginForm || signupForm) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initAuth);
    } else {
      initAuth();
    }
  }

  /**
   * Initialize authentication page
   */
  function initAuth() {
    // Tab switching
    if (loginTab && signupTab) {
      loginTab.addEventListener('click', function() { switchTab('login'); });
      signupTab.addEventListener('click', function() { switchTab('signup'); });
    }

    // Form submissions
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (signupForm) signupForm.addEventListener('submit', handleSignup);

    // Password visibility toggles
    document.querySelectorAll('.toggle-password').forEach(function(btn) {
      btn.addEventListener('click', togglePasswordVisibility);
    });

    // Password strength meter
    var passwordInput = document.getElementById('signupPassword');
    if (passwordInput) {
      passwordInput.addEventListener('input', updatePasswordStrength);
    }

    // Real-time validation
    setupRealTimeValidation();
  }

  /**
   * Switch between login and signup tabs
   */
  function switchTab(tab) {
    var tabs = document.querySelectorAll('.auth-tab');
    var forms = document.querySelectorAll('.auth-form');

    tabs.forEach(function(t) {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });

    forms.forEach(function(f) { f.classList.remove('active'); });

    if (tab === 'login') {
      loginTab.classList.add('active');
      loginTab.setAttribute('aria-selected', 'true');
      loginForm.classList.add('active');
    } else {
      signupTab.classList.add('active');
      signupTab.setAttribute('aria-selected', 'true');
      signupForm.classList.add('active');
    }
  }

  /**
   * Handle login form submission
   */
  async function handleLogin(e) {
    e.preventDefault();
    clearErrors();

    var email = document.getElementById('loginEmail').value.trim();
    var password = document.getElementById('loginPassword').value;
    var isValid = true;

    if (!validateEmail(email)) {
      showError('loginEmailError', 'Please enter a valid email address');
      isValid = false;
    }

    if (!password) {
      showError('loginPasswordError', 'Password is required');
      isValid = false;
    }

    if (!isValid) return;

    var submitBtn = document.getElementById('loginSubmit');
    submitBtn.classList.add('loading');

    try {
      var fbAuth = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
      var userCred = await fbAuth.signInWithEmailAndPassword(window.db.auth, email, password);
      
      // Admin Panel Access Logic
      try {
        var fbFirestore = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        var userDocRef = fbFirestore.doc(window.db.firestore, 'users', userCred.user.uid);
        var userDocSnap = await fbFirestore.getDoc(userDocRef);
        
        if (userDocSnap.exists() && userDocSnap.data().role === 'admin') {
           showToast('Admin access verified.', 'success');
           window.location.href = 'pages/admin.html';
           return;
        }
      } catch(e) {
        console.warn('Role verification issue:', e);
      }
      
      showToast('Successfully signed in', 'success');
      window.location.href = 'pages/dashboard.html';
    } catch (error) {
      handleAuthError(error, 'login');
    } finally {
      submitBtn.classList.remove('loading');
    }
  }

  /**
   * Handle signup form submission
   */
  async function handleSignup(e) {
    e.preventDefault();
    clearErrors();

    var name = document.getElementById('signupName').value.trim();
    var email = document.getElementById('signupEmail').value.trim();
    var password = document.getElementById('signupPassword').value;
    var confirmPassword = document.getElementById('signupConfirm').value;
    var isValid = true;

    if (name.length < 2) {
      showError('signupNameError', 'Name must be at least 2 characters');
      isValid = false;
    }

    if (name.length > 100) {
      showError('signupNameError', 'Name must be less than 100 characters');
      isValid = false;
    }

    if (!validateEmail(email)) {
      showError('signupEmailError', 'Please enter a valid email address');
      isValid = false;
    }

    var passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      showError('signupPasswordError', passwordValidation.message);
      isValid = false;
    }

    if (password !== confirmPassword) {
      showError('signupConfirmError', 'Passwords do not match');
      isValid = false;
    }

    if (!isValid) return;

    var submitBtn = document.getElementById('signupSubmit');
    submitBtn.classList.add('loading');

    try {
      var fbAuth = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
      var fbFirestore = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');

      // Create auth user
      var userCredential = await fbAuth.createUserWithEmailAndPassword(window.db.auth, email, password);

      // Set display name
      await fbAuth.updateProfile(userCredential.user, { displayName: name });

      // Create user document in Firestore
      await fbFirestore.setDoc(
        fbFirestore.doc(window.db.firestore, 'users', userCredential.user.uid),
        {
          name: name,
          email: email,
          total_spent: 0,
          createdAt: fbFirestore.serverTimestamp(),
          updatedAt: fbFirestore.serverTimestamp()
        }
      );

      showToast('Account created successfully!', 'success');
      window.location.href = 'pages/dashboard.html';
    } catch (error) {
      handleAuthError(error, 'signup');
    } finally {
      submitBtn.classList.remove('loading');
    }
  }

  /**
   * Validate email format
   */
  function validateEmail(email) {
    var re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return re.test(email) && email.length <= 254;
  }

  /**
   * Validate password strength
   */
  function validatePassword(password) {
    if (password.length < 8) return { valid: false, message: 'Password must be at least 8 characters' };
    if (password.length > 128) return { valid: false, message: 'Password must be less than 128 characters' };
    if (!/[A-Z]/.test(password)) return { valid: false, message: 'Must contain at least one uppercase letter' };
    if (!/[a-z]/.test(password)) return { valid: false, message: 'Must contain at least one lowercase letter' };
    if (!/[0-9]/.test(password)) return { valid: false, message: 'Must contain at least one number' };
    return { valid: true };
  }

  /**
   * Update password strength meter UI
   */
  function updatePasswordStrength(e) {
    var password = e.target.value;
    var strengthEl = document.getElementById('passwordStrength');
    if (!strengthEl) return;

    var fill = strengthEl.querySelector('.strength-fill');
    var text = strengthEl.querySelector('.strength-text');

    var score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    fill.className = 'strength-fill';

    if (password.length === 0) {
      text.textContent = '';
      return;
    }

    if (score <= 2) {
      fill.classList.add('weak');
      text.textContent = 'Weak';
    } else if (score <= 3) {
      fill.classList.add('fair');
      text.textContent = 'Fair';
    } else if (score <= 4) {
      fill.classList.add('good');
      text.textContent = 'Good';
    } else {
      fill.classList.add('strong');
      text.textContent = 'Strong';
    }
  }

  /**
   * Toggle password visibility
   */
  function togglePasswordVisibility(e) {
    var targetId = e.currentTarget.dataset.target;
    var input = document.getElementById(targetId);
    if (!input) return;

    var isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    e.currentTarget.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
  }

  /**
   * Setup real-time form validation
   */
  function setupRealTimeValidation() {
    var emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach(function(input) {
      input.addEventListener('blur', function() {
        if (input.value && !validateEmail(input.value)) {
          var errorId = input.id.replace('Email', 'EmailError');
          var errorEl = document.getElementById(errorId);
          if (errorEl) errorEl.textContent = 'Please enter a valid email';
        }
      });

      input.addEventListener('input', function() {
        var errorId = input.id.replace('Email', 'EmailError');
        var errorEl = document.getElementById(errorId);
        if (errorEl) errorEl.textContent = '';
      });
    });
  }

  /**
   * Show form error message
   */
  function showError(elementId, message) {
    var el = document.getElementById(elementId);
    if (el) el.textContent = message;
  }

  /**
   * Clear all form errors
   */
  function clearErrors() {
    document.querySelectorAll('.form-error').forEach(function(el) {
      el.textContent = '';
    });
  }

  /**
   * Handle Firebase Auth errors
   */
  function handleAuthError(error, context) {
    var messageEl = document.getElementById(context + 'Message');
    var message = 'An unexpected error occurred. Please try again.';

    switch (error.code) {
      case 'auth/email-already-in-use':
        message = 'This email is already registered';
        break;
      case 'auth/invalid-email':
        message = 'Invalid email address';
        break;
      case 'auth/weak-password':
        message = 'Password is too weak';
        break;
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        message = 'Invalid email or password';
        break;
      case 'auth/too-many-requests':
        message = 'Too many attempts. Please try again later.';
        break;
      case 'auth/network-request-failed':
        message = 'Network error. Check your connection.';
        break;
    }

    if (messageEl) {
      messageEl.textContent = message;
      messageEl.classList.add('error');
    } else {
      showToast(message, 'error');
    }
  }

  /**
   * Show toast notification
   */
  

})();
