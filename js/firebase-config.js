/**
 * Firebase Configuration
 * Replace placeholder values with your actual Firebase project credentials.
 * Get these from: Firebase Console > Project Settings > General > Your apps
 *
 * Loaded as a classic <script> tag — sets window globals.
 */
(function() {
  'use strict';

  window.FIREBASE_CONFIG = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  };

  window.FUNCTIONS_BASE_URL = "https://YOUR_REGION-YOUR_PROJECT_ID.cloudfunctions.net";
  window.CRM_COUPON_THRESHOLD = 100;

})();
