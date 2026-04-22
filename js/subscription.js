(function() {
  'use strict';

  var SubscriptionBox = {
    subscriptions: [],
    plans: [
      { id: 'starter', name: 'Starter Box', price: 29.99, period: 'month', items: 2, desc: '2 curated tech essentials' },
      { id: 'pro', name: 'Pro Box', price: 49.99, period: 'month', items: 4, desc: '4 premium products' },
      { id: 'elite', name: 'Elite Box', price: 89.99, period: 'month', items: 6, desc: '6 top-tier items' }
    ],

    init: function() {
      this.loadSubscriptions();
      this.createWidget();
    },

    loadSubscriptions: function() {
      try {
        var saved = localStorage.getItem('dragon_subscriptions');
        this.subscriptions = saved ? JSON.parse(saved) : [];
      } catch(e) {
        this.subscriptions = [];
      }
    },

    saveSubscriptions: function() {
      try {
        localStorage.setItem('dragon_subscriptions', JSON.stringify(this.subscriptions));
      } catch(e) {}
    },

    createWidget: function() {
      var section = document.createElement('section');
      section.id = 'subscriptionSection';
      section.className = 'subscription-section';
      section.innerHTML =
        '<div class="container">' +
          '<div class="section-header">' +
            '<p class="section-eyebrow">Curated Monthly</p>' +
            '<h2 class="section-title">Subscription Boxes</h2>' +
            '<p class="section-sub">Get hand-picked tech delivered monthly</p>' +
          '</div>' +
          '<div class="subscription-plans" id="subscriptionPlans"></div>' +
          '<div class="subscription-current" id="subscriptionCurrent" style="display:none;">' +
            '<h3>Your Active Subscription</h3>' +
            '<div class="current-plan"></div>' +
            '<button class="btn btn-outline btn-sm" id="cancelSubBtn">Cancel Subscription</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(section);
      this.renderPlans();
      this.bindEvents(section);
    },

    bindEvents: function(section) {
      var cancelBtn = section.querySelector('#cancelSubBtn');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
          SubscriptionBox.cancelSubscription();
        });
      }
    },

    renderPlans: function() {
      var container = document.getElementById('subscriptionPlans');
      var current = document.getElementById('subscriptionCurrent');
      if (!container) return;

      var fmt = window.currency ? window.currency.formatPrice : function(p) { return '$' + p.toFixed(2); };

      container.innerHTML = this.plans.map(function(plan) {
        var isActive = SubscriptionBox.subscriptions.some(function(s) {
          return s.planId === plan.id && s.status === 'active';
        });
        return '<div class="subscription-plan' + (isActive ? ' active' : '') + '" data-id="' + plan.id + '">' +
          '<div class="plan-badge">' + (isActive ? 'Active' : '') + '</div>' +
          '<h3 class="plan-name">' + plan.name + '</h3>' +
          '<div class="plan-price">' + fmt(plan.price) + '<span>/' + plan.period + '</span></div>' +
          '<p class="plan-desc">' + plan.desc + '</p>' +
          '<ul class="plan-features">' +
            '<li>Curated selection</li>' +
            '<li>Flexibly skip months</li>' +
            '<li>10% off all items</li>' +
            '<li>Free shipping</li>' +
          '</ul>' +
          '<button class="btn ' + (isActive ? 'btn-outline' : 'btn-primary') + ' subscribe-btn" ' +
            'data-plan="' + plan.id + '">' +
            (isActive ? 'Manage' : 'Subscribe') +
          '</button>' +
        '</div>';
      }).join('');

      container.querySelectorAll('.subscribe-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var planId = btn.dataset.plan;
          SubscriptionBox.subscribe(planId);
        });
      });

      if (this.subscriptions.length && current) {
        current.style.display = '';
        var activeSub = this.subscriptions.find(function(s) {
          return s.status === 'active';
        });
        if (activeSub) {
          var plan = this.plans.find(function(p) { return p.id === activeSub.planId; });
          var planEl = current.querySelector('.current-plan');
          if (planEl && plan) {
            planEl.innerHTML = '<strong>' + plan.name + '</strong> — ' + fmt(plan.price) + '/month<br>' +
              '<span>Next delivery: ' + this.getNextDelivery(activeSub) + '</span>';
          }
        }
      }
    },

    subscribe: function(planId) {
      var plan = this.plans.find(function(p) { return p.id === planId; });
      if (!plan) return;

      var existing = this.subscriptions.findIndex(function(s) {
        return s.planId === planId;
      });

      if (existing !== -1) {
        this.subscriptions[existing].status = 'active';
        this.subscriptions[existing].updatedAt = Date.now();
      } else {
        this.subscriptions.push({
          planId: planId,
          status: 'active',
          subscribedAt: Date.now(),
          nextDelivery: Date.now() + 30 * 24 * 60 * 60 * 1000
        });
      }

      this.saveSubscriptions();

      if (window.utils) {
        window.utils.showToast('Subscribed to ' + plan.name + '!', 'success');
      }

      this.renderPlans();
    },

    cancelSubscription: function() {
      var active = this.subscriptions.findIndex(function(s) {
        return s.status === 'active';
      });

      if (active !== -1) {
        this.subscriptions[active].status = 'cancelled';
        this.saveSubscriptions();

        if (window.utils) {
          window.utils.showToast('Subscription cancelled', 'info');
        }

        this.renderPlans();
      }
    },

    getNextDelivery: function(sub) {
      if (!sub || !sub.nextDelivery) return 'N/A';
      var date = new Date(sub.nextDelivery);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    },

    isSubscribed: function() {
      return this.subscriptions.some(function(s) {
        return s.status === 'active';
      });
    },

    getDiscount: function() {
      return 0.1;
    }
  };

  window.SubscriptionBox = SubscriptionBox;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { SubscriptionBox.init(); });
  } else { SubscriptionBox.init(); }

})();