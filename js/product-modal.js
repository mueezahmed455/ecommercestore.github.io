/**
 * Dragon-Tech Product Modal — v2.0 (Local-Only)
 * Full product detail overlay with reviews, wishlist, and cart integration.
 */
(function () {
  'use strict';

  function fmt(usd) { return window.currency ? window.currency.formatPrice(usd) : '$' + usd.toFixed(2); }
  function esc(s) { return window.utils ? window.utils.escapeHtml(s) : String(s); }
  function toast(msg, type) { if (window.utils) window.utils.showToast(msg, type); }

  function stars(rating, size) {
    var full = Math.round(rating || 0);
    var s = size || '1rem';
    var h = '';
    for (var i = 1; i <= 5; i++) {
      h += '<span style="color:' + (i <= full ? '#fbbf24' : 'rgba(255,255,255,0.15)') + ';font-size:' + s + ';">★</span>';
    }
    return h;
  }

  function getReviews(productId) {
    try { return JSON.parse(localStorage.getItem('dt_reviews_' + productId) || '[]'); } catch (e) { return []; }
  }

  function saveReviews(productId, reviews) {
    try { localStorage.setItem('dt_reviews_' + productId, JSON.stringify(reviews)); } catch (e) {}
  }

  function getAvgRating(reviews) {
    if (!reviews.length) return 0;
    return reviews.reduce(function (s, r) { return s + r.rating; }, 0) / reviews.length;
  }

  function buildReviewList(reviews, productId) {
    if (!reviews.length) {
      return '<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:0.85rem;">No reviews yet — be the first!</div>';
    }
    return reviews.slice(0, 5).map(function (r) {
      return '<div class="review-card">' +
        '<div class="review-head">' +
          '<div class="reviewer-info">' +
            '<div class="reviewer-avatar">' + (r.author || 'A')[0].toUpperCase() + '</div>' +
            '<div><div class="reviewer-name">' + esc(r.author || 'Anonymous') + '</div>' +
            '<div class="review-date">' + (r.date ? new Date(r.date).toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric'}) : '—') + '</div></div>' +
          '</div>' +
          '<div class="review-rating">' + stars(r.rating, '0.9rem') + '</div>' +
        '</div>' +
        '<p class="review-text">' + esc(r.text || '') + '</p>' +
        '<button class="helpful-btn" data-rid="' + r.id + '" data-pid="' + productId + '">' +
          '👍 Helpful (' + (r.helpful || 0) + ')' +
        '</button>' +
      '</div>';
    }).join('');
  }

  function buildModal(product) {
    var price  = product.salePrice || product.price;
    var origP  = product.salePrice ? product.price : null;
    var disc   = origP ? Math.round((1 - product.salePrice / product.price) * 100) : 0;
    var reviews = getReviews(product.id);
    var avgR    = getAvgRating(reviews);
    var isWl    = window.storage ? window.storage.isInWishlist(product.id) : false;
    var user    = window.storage ? window.storage.getCurrentUser() : null;

    var badgeCls = { sale: 'badge-sale', new: 'badge-new', bestseller: 'badge-bestseller' };
    var badgeTxt = { sale: 'SALE', new: 'NEW', bestseller: 'BEST' };

    return '<div class="modal-overlay" id="modalOverlay">' +
      '<div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="modalProductName">' +
        '<button class="modal-close" id="modalClose" aria-label="Close modal">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
        '</button>' +
        '<div class="modal-layout">' +

          // Gallery
          '<div class="modal-gallery">' +
            (product.badge ? '<span class="card-badge ' + (badgeCls[product.badge]||'badge-new') + '" style="position:absolute;top:16px;left:16px;">' + (badgeTxt[product.badge]||product.badge) + '</span>' : '') +
            '<img class="modal-img" src="' + esc(product.image) + '" alt="' + esc(product.name) + '" id="modalImg">' +
          '</div>' +

          // Details
          '<div class="modal-details">' +
            '<div class="modal-category">' + esc(product.category) + '</div>' +
            '<h2 class="modal-name" id="modalProductName">' + esc(product.name) + '</h2>' +

            '<div class="modal-rating">' +
              '<div class="modal-stars">' + stars(avgR || product.rating, '1rem') + '</div>' +
              '<span class="modal-rating-text">' +
                (avgR ? avgR.toFixed(1) + ' / 5' : product.rating + ' / 5') +
                ' &nbsp;•&nbsp; ' + reviews.length + ' review' + (reviews.length !== 1 ? 's' : '') +
              '</span>' +
            '</div>' +

            '<div class="modal-price-row">' +
              '<span class="modal-price price-display" data-price-usd="' + price + '">' + fmt(price) + '</span>' +
              (origP ? '<span class="modal-original price-display" data-price-usd="' + origP + '">' + fmt(origP) + '</span>' : '') +
              (disc > 0 ? '<span class="card-discount">−' + disc + '%</span>' : '') +
            '</div>' +

            '<p class="modal-desc">' + esc(product.description) + '</p>' +

            '<div class="modal-stock">' +
              '<span class="stock-dot ' + (product.inStock !== false ? 'in' : 'out') + '"></span>' +
              '<span class="' + (product.inStock !== false ? 'stock-in' : 'stock-out') + '">' +
                (product.inStock !== false ? 'In Stock — Ready to ship' : 'Out of Stock') +
              '</span>' +
            '</div>' +

            '<div class="modal-actions">' +
              (product.inStock !== false
                ? '<button class="btn btn-primary modal-add-cart btn-lg" data-id="' + product.id + '" style="flex:1;">Add to Cart</button>'
                : '<button class="btn btn-outline btn-lg" disabled style="flex:1;opacity:0.5;">Out of Stock</button>') +
              '<button class="modal-wishlist' + (isWl ? ' active' : '') + '" id="modalWishlistBtn" data-id="' + product.id + '" aria-label="Toggle wishlist" title="Wishlist">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="' + (isWl ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="2">' +
                  '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>' +
                '</svg>' +
              '</button>' +
            '</div>' +

            // Reviews
            '<div class="modal-reviews-section">' +
              '<div class="modal-reviews-title">Customer Reviews</div>' +
              '<div id="modalReviewList">' + buildReviewList(reviews, product.id) + '</div>' +

              // Write review
              (user
                ? '<div class="write-review-section" id="writeReviewSection">' +
                    '<div class="write-review-title">Write a Review</div>' +
                    '<div class="star-selector" id="starSelector">' +
                      [1,2,3,4,5].map(function(n){ return '<span class="star-sel" data-val="' + n + '">★</span>'; }).join('') +
                    '</div>' +
                    '<input type="hidden" id="selectedRating" value="0">' +
                    '<div class="form-group" style="margin-top:12px;">' +
                      '<textarea id="reviewText" class="form-input" style="min-height:90px;resize:vertical;" placeholder="Share your experience…"></textarea>' +
                    '</div>' +
                    '<button class="btn btn-primary btn-sm" id="submitReviewBtn" data-pid="' + product.id + '">Post Review</button>' +
                  '</div>'
                : '<p style="font-size:0.8rem;color:var(--text-muted);margin-top:12px;"><a href="login.html" style="color:var(--accent);">Sign in</a> to write a review.</p>'
              ) +
            '</div>' +

          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function bindModalEvents(product) {
    // Close
    function closeModal() {
      var overlay = document.getElementById('modalOverlay');
      if (overlay) {
        overlay.style.animation = 'none';
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.2s';
        setTimeout(function () {
          var container = document.getElementById('productModal');
          if (container) container.innerHTML = '';
          document.body.style.overflow = '';
          window.dispatchEvent(new Event('productModalClose'));
        }, 200);
      }
    }

    var closeBtn = document.getElementById('modalClose');
    var overlay = document.getElementById('modalOverlay');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', function (e) {
      if (e.target === this) closeModal();
    });
    document.addEventListener('keydown', function escHandler(e) {
      if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', escHandler); }
    });

    // Add to cart
    var atcBtn = document.querySelector('.modal-add-cart');
    if (atcBtn) atcBtn.addEventListener('click', function () {
      if (window.cart) window.cart.addToCart(product.id);
      atcBtn.textContent = '✓ Added!';
      setTimeout(function () { atcBtn.textContent = 'Add to Cart'; }, 1600);
    });

    // Wishlist
    var wlBtn = document.getElementById('modalWishlistBtn');
    if (wlBtn) wlBtn.addEventListener('click', function () {
      if (!window.storage) return;
      var added = window.storage.toggleWishlist(product.id);
      this.classList.toggle('active', added);
      var path = this.querySelector('path');
      if (path) path.setAttribute('fill', added ? 'currentColor' : 'none');
      toast(added ? 'Added to Wishlist' : 'Removed from Wishlist', added ? 'success' : 'info');
      if (window.wishlist) window.wishlist.updateBadge();
    });

    // Helpful buttons
    document.querySelectorAll('.helpful-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var pid = this.dataset.pid;
        var rid = this.dataset.rid;
        var reviews = getReviews(pid);
        var r = reviews.find(function (x) { return x.id === rid; });
        if (r) { r.helpful = (r.helpful || 0) + 1; saveReviews(pid, reviews); this.textContent = '👍 Helpful (' + r.helpful + ')'; }
      });
    });

    // Star selector
    var stars = document.querySelectorAll('.star-sel');
    var ratingInput = document.getElementById('selectedRating');
    stars.forEach(function (star) {
      star.addEventListener('mouseover', function () {
        var val = parseInt(this.dataset.val);
        stars.forEach(function (s) { s.classList.toggle('active', parseInt(s.dataset.val) <= val); });
      });
      star.addEventListener('mouseout', function () {
        var chosen = parseInt((ratingInput||{}).value || 0);
        stars.forEach(function (s) { s.classList.toggle('active', parseInt(s.dataset.val) <= chosen); });
      });
      star.addEventListener('click', function () {
        var val = this.dataset.val;
        if (ratingInput) ratingInput.value = val;
        stars.forEach(function (s) { s.classList.toggle('active', parseInt(s.dataset.val) <= parseInt(val)); });
      });
    });

    // Submit review
    var submitBtn = document.getElementById('submitReviewBtn');
    if (submitBtn) {
      submitBtn.addEventListener('click', function () {
        var pid = this.dataset.pid;
        var rating = parseInt((document.getElementById('selectedRating')||{}).value || 0);
        var text = ((document.getElementById('reviewText')||{}).value || '').trim();
        var user = window.storage ? window.storage.getCurrentUser() : null;

        if (!rating || rating < 1 || rating > 5) { toast('Please select a star rating', 'error'); return; }
        if (!text || text.length < 10) { toast('Review must be at least 10 characters', 'error'); return; }
        if (!user) { toast('Please sign in to write a review', 'error'); return; }

        var reviews = getReviews(pid);
        var newReview = {
          id:      'rev_' + Date.now(),
          author:  user.name || 'Anonymous',
          userId:  user.uid,
          rating:  rating,
          text:    text,
          helpful: 0,
          date:    new Date().toISOString()
        };
        reviews.unshift(newReview);
        saveReviews(pid, reviews);

        var listEl = document.getElementById('modalReviewList');
        if (listEl) listEl.innerHTML = buildReviewList(reviews, pid);
        document.getElementById('reviewText').value = '';
        if (document.getElementById('selectedRating')) document.getElementById('selectedRating').value = 0;
        stars.forEach(function (s) { s.classList.remove('active'); });
        toast('Review posted — thank you!', 'success');
      });
    }
  }

  // ---- Public API ----
  window.openProductModal = function (productId) {
    var product = window.getProductById ? window.getProductById(productId) : null;
    if (!product) { toast('Product not found', 'error'); return; }

    var container = document.getElementById('productModal');
    if (!container) return;

    container.innerHTML = buildModal(product);
    document.body.style.overflow = 'hidden';
    bindModalEvents(product);
    if (window.storage) window.storage.addToRecentlyViewed(productId);
    if (window.storage) window.storage.logEvent('view_product', { productId: productId });
  };

})();
