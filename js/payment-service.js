/**
 * Payment Service
 * Mock Stripe Elements integration for Pure Static sites.
 */
(function() {
  'use strict';

  /**
   * Initialize Stripe Elements UI
   * @param {string} containerId - The ID of the container to mount the card element
   */
  function initStripeElements(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    // In a real app, you would use Stripe.js here.
    // For this static "prod-ready" version, we'll create a high-fidelity mock.
    container.innerHTML = `
      <div class="stripe-mock-elements glass" style="padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem;">
        <div class="form-group" style="margin-bottom: 1rem;">
          <label class="form-label" style="font-size: 0.75rem; color: var(--text-secondary);">Card Details</label>
          <div id="card-element-mock" style="padding: 12px; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); border-radius: 8px; color: white;">
            <div style="display: flex; gap: 10px; align-items: center;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              <input type="text" id="mock-card-number" placeholder="4242 4242 4242 4242" style="background:none; border:none; color:white; flex:1; outline:none; font-family:var(--font-mono);">
            </div>
            <div style="display: flex; gap: 10px; margin-top: 10px;">
              <input type="text" id="mock-card-expiry" placeholder="MM / YY" style="background:none; border:none; color:white; width: 80px; outline:none; font-family:var(--font-mono);">
              <input type="text" id="mock-card-cvc" placeholder="CVC" style="background:none; border:none; color:white; width: 60px; outline:none; font-family:var(--font-mono);">
            </div>
          </div>
        </div>
        <div id="card-errors" class="form-error" style="font-size: 0.75rem;"></div>
      </div>
    `;
  }

  /**
   * Process payment simulation
   * @returns {Promise} - Resolves with a mock payment intent result
   */
  function processPayment() {
    return new Promise((resolve, reject) => {
      // Simulate network latency
      setTimeout(() => {
        var cardNumber = document.getElementById('mock-card-number')?.value;
        if (!cardNumber || cardNumber.length < 16) {
          reject(new Error('Invalid card details'));
          return;
        }

        // Always succeed for demo purposes
        resolve({
          status: 'succeeded',
          paymentIntentId: 'pi_' + Math.random().toString(36).substr(2, 9)
        });
      }, 1500);
    });
  }

  window.paymentService = {
    init: initStripeElements,
    process: processPayment
  };
})();
