/**
 * Product Detail Modal
 * Full-screen modal with product info, reviews, and actions.
 * Exposes window.openProductModal(productId) globally.
 */
(function() {
  'use strict';

  // ---- State ----
  var currentProductId = null;
  var isModalOpen = false;
  var previousScrollY = 0;
  var reviewFormVisible = false;
  var reviewsCache = {};

  var BADGE_LABELS = {
    'sale': { text: 'SALE', color: '#FF107A' },
    'new': { text: 'NEW', color: '#00E1FF' },
    'bestseller': { text: 'BESTSELLER', color: '#FF6600' },
    'exclusive': { text: 'EXCLUSIVE', color: '#B026FF' }
  };

  // ---- Utilities ----

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  

  function getFirestore() {
    if (!window.db || !window.db.firestore) {
      console.warn('Firestore not initialized.');
      return null;
    }
    return window.db.firestore;
  }

  /**
   * Generate star rating HTML
   */
  function renderStars(rating, size) {
    var html = '';
    for (var i = 1; i <= 5; i++) {
      html += '<span class="review-star' + (i <= Math.round(rating) ? ' filled' : '') + '">&#9733;</span>';
    }
    return html;
  }

  /**
   * Format date for display
   */
  function formatDate(timestamp) {
    if (!timestamp) return '';
    var date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  // ---- Recently Viewed (localStorage) ----

  function addToRecentlyViewed(productId) {
    try {
      var viewed = JSON.parse(localStorage.getItem('dragon_recently_viewed') || '[]');
      // Remove if already present, then add to front
      viewed = viewed.filter(function(id) { return id !== productId; });
      viewed.unshift(productId);
      // Keep max 10
      viewed = viewed.slice(0, 10);
      localStorage.setItem('dragon_recently_viewed', JSON.stringify(viewed));
    } catch (e) {
      console.error('Failed to save recently viewed:', e);
    }
  }

  // ---- Wishlist (localStorage) ----

  function getWishlist() {
    try {
      return JSON.parse(localStorage.getItem('dragon_wishlist') || '[]');
    } catch (e) {
      return [];
    }
  }

  function isInWishlist(productId) {
    return getWishlist().indexOf(productId) !== -1;
  }

  function toggleWishlist(productId) {
    var wishlist = getWishlist();
    var index = wishlist.indexOf(productId);
    var btn = document.getElementById('modalWishlistBtn');

    if (index === -1) {
      wishlist.push(productId);
      if (btn) btn.classList.add('active');
      showToast('Added to wishlist', 'success');
    } else {
      wishlist.splice(index, 1);
      if (btn) btn.classList.remove('active');
      showToast('Removed from wishlist', 'info');
    }

    try {
      localStorage.setItem('dragon_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to save wishlist:', e);
    }
  }

  // ---- Reviews (Firestore) ----

  async function loadReviews(productId) {
    var firestore = getFirestore();
    if (!firestore) {
      return [];
    }

    try {
      var fbFirestore = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
      var collection = fbFirestore.collection;
      var query = fbFirestore.query;
      var orderBy = fbFirestore.orderBy;
      var limit = fbFirestore.limit;
      var getDocs = fbFirestore.getDocs;

      var reviewsRef = collection(firestore, 'reviews', productId, 'items');
      var q = query(reviewsRef, orderBy('createdAt', 'desc'), limit(50));
      var snapshot = await getDocs(q);

      var reviews = [];
      snapshot.forEach(function(doc) {
        reviews.push({ id: doc.id, ...doc.data() });
      });

      reviewsCache[productId] = reviews;
      return reviews;
    } catch (error) {
      console.error('Failed to load reviews:', error);
      return reviewsCache[productId] || [];
    }
  }

  async function submitReview(productId, reviewData) {
    var firestore = getFirestore();
    if (!firestore) {
      showToast('Firestore not available. Please refresh.', 'error');
      return false;
    }

    try {
      var fbFirestore = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
      var collection = fbFirestore.collection;
      var addDoc = fbFirestore.addDoc;
      var serverTimestamp = fbFirestore.serverTimestamp;

      var reviewsRef = collection(firestore, 'reviews', productId, 'items');
      await addDoc(reviewsRef, {
        name: reviewData.name,
        rating: reviewData.rating,
        comment: reviewData.comment,
        createdAt: serverTimestamp()
      });

      // Refresh reviews
      await loadReviews(productId);
      renderReviewsSection(productId);
      showToast('Review submitted! Thank you.', 'success');
      return true;
    } catch (error) {
      console.error('Failed to submit review:', error);
      showToast('Failed to submit review. Please try again.', 'error');
      return false;
    }
  }

  // ---- Render Reviews Section ----

  function renderReviewsSection(productId) {
    var container = document.getElementById('modalReviewsList');
    var summaryEl = document.getElementById('modalReviewsSummary');
    if (!container) return;

    var reviews = reviewsCache[productId] || [];

    if (reviews.length === 0) {
      summaryEl.innerHTML = '<span class="reviews-count">No reviews yet</span>';
      container.innerHTML = '<p class="reviews-empty">Be the first to review this product.</p>';
      return;
    }

    // Calculate average
    var totalRating = 0;
    reviews.forEach(function(r) { totalRating += r.rating; });
    var avg = (totalRating / reviews.length).toFixed(1);

    summaryEl.innerHTML =
      '<span class="reviews-avg">' + avg + '</span>' +
      '<div class="reviews-stars">' + renderStars(parseFloat(avg)) + '</div>' +
      '<span class="reviews-count">' + reviews.length + ' review' + (reviews.length !== 1 ? 's' : '') + '</span>';

    container.innerHTML = reviews.map(function(review) {
      return '<div class="review-item">' +
        '<div class="review-item-header">' +
          '<span class="review-author">' + escapeHtml(review.name) + '</span>' +
          '<span class="review-date">' + formatDate(review.createdAt) + '</span>' +
        '</div>' +
        '<div class="review-stars">' + renderStars(review.rating) + '</div>' +
        '<p class="review-text">' + escapeHtml(review.comment) + '</p>' +
      '</div>';
    }).join('');
  }

  // ---- Render Review Form ----

  function renderReviewForm() {
    var container = document.getElementById('modalReviewForm');
    if (!container) return;

    container.innerHTML =
      '<div class="review-form">' +
        '<h4 class="review-form-title">Write a Review</h4>' +
        '<form id="reviewForm">' +
          '<div class="form-group">' +
            '<label for="reviewName">Your Name</label>' +
            '<input type="text" id="reviewName" placeholder="Enter your name" required maxlength="50">' +
          '</div>' +
          '<div class="form-group">' +
            '<label>Rating</label>' +
            '<div class="star-rating-input">' +
              '<input type="radio" name="reviewRating" id="star5" value="5"><label for="star5" title="5 stars">&#9733;</label>' +
              '<input type="radio" name="reviewRating" id="star4" value="4"><label for="star4" title="4 stars">&#9733;</label>' +
              '<input type="radio" name="reviewRating" id="star3" value="3"><label for="star3" title="3 stars">&#9733;</label>' +
              '<input type="radio" name="reviewRating" id="star2" value="2"><label for="star2" title="2 stars">&#9733;</label>' +
              '<input type="radio" name="reviewRating" id="star1" value="1"><label for="star1" title="1 star">&#9733;</label>' +
            '</div>' +
          '</div>' +
          '<div class="form-group">' +
            '<label for="reviewComment">Your Review</label>' +
            '<textarea id="reviewComment" placeholder="Share your experience..." required maxlength="500"></textarea>' +
          '</div>' +
          '<div class="review-form-actions">' +
            '<button type="submit" class="review-submit-btn">Submit Review</button>' +
            '<button type="button" class="review-cancel-btn" id="cancelReviewBtn">Cancel</button>' +
          '</div>' +
        '</form>' +
      '</div>';

    // Attach form submit handler
    document.getElementById('reviewForm').addEventListener('submit', function(e) {
      e.preventDefault();

      var name = document.getElementById('reviewName').value.trim();
      var comment = document.getElementById('reviewComment').value.trim();
      var ratingEl = document.querySelector('input[name="reviewRating"]:checked');

      if (!name || !comment || !ratingEl) {
        showToast('Please fill in all fields and select a rating.', 'error');
        return;
      }

      submitReview(currentProductId, {
        name: name,
        rating: parseInt(ratingEl.value, 10),
        comment: comment
      }).then(function(success) {
        if (success) {
          hideReviewForm();
        }
      });
    });

    // Cancel button
    document.getElementById('cancelReviewBtn').addEventListener('click', hideReviewForm);
  }

  function showReviewForm() {
    var formContainer = document.getElementById('modalReviewForm');
    var writeBtn = document.getElementById('writeReviewBtn');
    if (formContainer) {
      renderReviewForm();
      formContainer.style.display = 'block';
      reviewFormVisible = true;
    }
    if (writeBtn) writeBtn.style.display = 'none';
  }

  function hideReviewForm() {
    var formContainer = document.getElementById('modalReviewForm');
    var writeBtn = document.getElementById('writeReviewBtn');
    if (formContainer) {
      formContainer.style.display = 'none';
      formContainer.innerHTML = '';
      reviewFormVisible = false;
    }
    if (writeBtn) writeBtn.style.display = '';
  }

  // ---- Modal Build & Render ----

  function buildModalHTML(product) {
    var inWishlist = isInWishlist(product.id);
    var currentPrice = product.salePrice || product.price;
    var originalPrice = product.salePrice ? product.price : null;
    var discount = product.salePrice ? Math.round((1 - product.salePrice / product.price) * 100) : 0;

    return '<div class="product-modal-overlay" id="productModalOverlay" role="dialog" aria-modal="true" aria-label="' + escapeHtml(product.name) + '">' +
      '<div class="product-modal">' +
        '<button class="product-modal-close" id="modalCloseBtn" aria-label="Close modal">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
            '<line x1="18" y1="6" x2="6" y2="18"/>' +
            '<line x1="6" y1="6" x2="18" y2="18"/>' +
          '</svg>' +
        '</button>' +
        '<div class="product-modal-body">' +
          '<div class="product-modal-content">' +
            '<div class="product-modal-gallery">' +
              (product.badge ? '<div class="product-modal-image-badge"><span class="tier-badge" style="background:' + (BADGE_LABELS[product.badge] ? BADGE_LABELS[product.badge].color : 'var(--neon-blue)') + '; color:white; font-size:0.7rem; font-weight:700; padding:4px 10px; border-radius:4px; text-transform:uppercase;">' + (BADGE_LABELS[product.badge] ? BADGE_LABELS[product.badge].text : product.badge) + '</span></div>' : '') +
              '<img src="' + product.image + '" alt="' + escapeHtml(product.name) + '" class="product-modal-image">' +
            '</div>' +
            '<div class="product-modal-details">' +
              (product.category ? '<span class="product-modal-category" style="text-transform:capitalize; color:var(--text-muted); font-size:0.75rem; font-weight:600; letter-spacing:1px;">' + escapeHtml(product.category) + '</span>' : '') +
              '<h2 class="product-modal-name">' + escapeHtml(product.name) + '</h2>' +
              '<div class="product-modal-price-row" style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">' +
                '<span class="product-modal-price" style="font-size:1.75rem; font-family:var(--font-display); font-weight:700; color:' + (product.salePrice ? 'var(--neon-pink)' : 'var(--neon-blue)') + ';">$' + currentPrice.toFixed(2) + '</span>' +
                (originalPrice ? '<span class="product-modal-original" style="font-size:1.1rem; color:var(--text-muted); text-decoration:line-through;">$' + originalPrice.toFixed(2) + '</span>' : '') +
                (discount > 0 ? '<span class="discount-tag" style="background:var(--neon-pink); color:white; font-size:0.7rem; font-weight:700; padding:4px 8px; border-radius:4px;">' + discount + '% OFF</span>' : '') +
              '</div>' +
              '<p class="product-modal-description" style="color:var(--text-secondary); line-height:1.6; margin-bottom:20px;">' + escapeHtml(product.description) + '</p>' +
              '<div class="product-modal-stock" style="display:flex; align-items:center; gap:8px; margin-bottom:16px; font-size:0.85rem;">' +
                '<span style="width:8px; height:8px; border-radius:50%; background:' + (product.inStock !== false ? 'var(--neon-green)' : 'var(--neon-pink)') + ';"></span>' +
                '<span style="color:' + (product.inStock !== false ? 'var(--neon-green)' : 'var(--neon-pink)') + ';">' + (product.inStock !== false ? 'In Stock' : 'Out of Stock') + '</span>' +
              '</div>' +
              '<div class="product-modal-actions">' +
                '<button class="modal-add-to-cart-btn" id="modalAddCartBtn"' + (product.inStock === false ? ' disabled' : '') + '>' +
                  'Add to Cart' +
                '</button>' +
                '<button class="modal-wishlist-btn' + (inWishlist ? ' active' : '') + '" id="modalWishlistBtn" aria-label="Toggle wishlist">' +
                  '<svg width="18" height="18" viewBox="0 0 24 24" fill="' + (inWishlist ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="2">' +
                    '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>' +
                  '</svg>' +
                  'Wishlist' +
                '</button>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="product-modal-reviews">' +
            '<div class="reviews-header">' +
              '<h3 class="reviews-title">Reviews</h3>' +
              '<button class="write-review-btn" id="writeReviewBtn">Write Review</button>' +
            '</div>' +
            '<div class="reviews-summary" id="modalReviewsSummary">' +
              '<span class="reviews-count">Loading...</span>' +
            '</div>' +
            '<div class="reviews-list" id="modalReviewsList"></div>' +
            '<div id="modalReviewForm" style="display: none;"></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  // ---- Open / Close ----

  function openModal(productId) {
    if (isModalOpen) return;

    // Resolve product
    var product = null;
    if (typeof window.getProductById === 'function') {
      product = window.getProductById(productId);
    }
    if (!product) {
      console.error('Product not found:', productId);
      return;
    }

    currentProductId = productId;
    isModalOpen = true;

    // Lock body scroll
    previousScrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = '-' + previousScrollY + 'px';
    document.body.style.width = '100%';

    // Build and inject modal
    var overlay = document.createElement('div');
    overlay.innerHTML = buildModalHTML(product);
    var modalEl = overlay.firstElementChild;
    document.body.appendChild(modalEl);

    // Track recently viewed
    addToRecentlyViewed(productId);

    // Force reflow then open
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        modalEl.classList.add('open');
      });
    });

    // Attach event listeners
    attachModalListeners();

    // Load reviews
    loadReviews(productId).then(function() {
      renderReviewsSection(productId);
    });
  }

  function closeModal() {
    if (!isModalOpen) return;

    var overlay = document.getElementById('productModalOverlay');
    if (!overlay) {
      resetBodyScroll();
      return;
    }

    isModalOpen = false;

    // Animate close
    overlay.classList.remove('open');
    overlay.classList.add('closing');

    setTimeout(function() {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      resetBodyScroll();
      hideReviewForm();
      currentProductId = null;
    }, 300);
  }

  function resetBodyScroll() {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, previousScrollY);
  }

  // ---- Event Listeners ----

  function attachModalListeners() {
    // Close button
    var closeBtn = document.getElementById('modalCloseBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    // Overlay click (outside modal)
    var overlay = document.getElementById('productModalOverlay');
    if (overlay) {
      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
          closeModal();
        }
      });
    }

    // Escape key
    document.addEventListener('keydown', handleKeyDown);

    // Add to cart
    var addCartBtn = document.getElementById('modalAddCartBtn');
    if (addCartBtn) {
      addCartBtn.addEventListener('click', function() {
        if (window.cart && window.cart.addToCart) {
          window.cart.addToCart(currentProductId);
          addCartBtn.textContent = 'Added!';
          addCartBtn.classList.add('added');
          setTimeout(function() {
            addCartBtn.textContent = 'Add to Cart';
            addCartBtn.classList.remove('added');
          }, 1500);
        }
      });
    }

    // Wishlist toggle
    var wishlistBtn = document.getElementById('modalWishlistBtn');
    if (wishlistBtn) {
      wishlistBtn.addEventListener('click', function() {
        toggleWishlist(currentProductId);
      });
    }

    // Write review button
    var writeReviewBtn = document.getElementById('writeReviewBtn');
    if (writeReviewBtn) {
      writeReviewBtn.addEventListener('click', showReviewForm);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape' && isModalOpen) {
      if (reviewFormVisible) {
        hideReviewForm();
      } else {
        closeModal();
      }
    }
  }

  // ---- Global API ----

  window.openProductModal = openModal;
  window.showProductModal = openModal; // Alias for compatibility

})();
