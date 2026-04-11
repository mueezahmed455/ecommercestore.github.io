/**
 * Product Reviews Module
 * Manages product reviews in Firestore.
 * Collection path: products/{productId}/reviews
 * Exposes window.reviews.
 */
(function() {
  'use strict';

  var REVIEWS_CONTAINER_ID = 'reviewsContainer';
  var FIRESTORE_MODULE_URL = 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

  // ---- Utility helpers ----

  

  

  function formatDate(ts) {
    if (!ts) return '';
    var d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function renderStarRating(rating, interactive, callback) {
    var html = '<span class="star-rating">';
    for (var i = 1; i <= 5; i++) {
      var cls = i <= rating ? 'star filled' : 'star';
      if (interactive) {
        html += '<span class="' + cls + '" data-value="' + i + '" role="button" tabindex="0" aria-label="' + i + ' star">&#9733;</span>';
      } else {
        html += '<span class="' + cls + '" aria-hidden="true">&#9733;</span>';
      }
    }
    html += '</span>';
    return html;
  }

  // ---- Firestore operations via dynamic import ----

  function getFirestoreFunctions() {
    return import(FIRESTORE_MODULE_URL).then(function(m) {
      return {
        collection: m.collection,
        doc: m.doc,
        addDoc: m.addDoc,
        query: m.query,
        orderBy: m.orderBy,
        serverTimestamp: m.serverTimestamp,
        updateDoc: m.updateDoc,
        increment: m.increment,
        getDocs: m.getDocs
      };
    });
  }

  // ---- Core API ----

  async function submitReview(productId, data) {
    if (!productId) throw new Error('productId is required');
    if (!data.userName || data.userName.trim().length < 2) {
      throw new Error('Name must be at least 2 characters');
    }
    if (!data.rating || data.rating < 1 || data.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
    if (!data.comment || data.comment.trim().length < 10) {
      throw new Error('Comment must be at least 10 characters');
    }

    var fb = await getFirestoreFunctions();
    var reviewsRef = fb.collection(window.db.firestore, 'products', productId, 'reviews');

    await fb.addDoc(reviewsRef, {
      userId: (window.db && window.db.auth && window.db.auth.currentUser) ? window.db.auth.currentUser.uid : null,
      userName: data.userName.trim(),
      rating: Number(data.rating),
      comment: data.comment.trim(),
      createdAt: fb.serverTimestamp(),
      helpful: 0
    });
  }

  async function getReviews(productId) {
    if (!productId) throw new Error('productId is required');

    var fb = await getFirestoreFunctions();
    var reviewsRef = fb.collection(window.db.firestore, 'products', productId, 'reviews');
    var q = fb.query(reviewsRef, fb.orderBy('createdAt', 'desc'));
    var snapshot = await fb.getDocs(q);

    var reviews = [];
    snapshot.forEach(function(doc) {
      reviews.push(Object.assign({ id: doc.id }, doc.data()));
    });
    return reviews;
  }

  async function getAverageRating(productId) {
    var reviews = await getReviews(productId);
    if (reviews.length === 0) {
      return { average: 0, count: 0 };
    }
    var total = reviews.reduce(function(sum, r) { return sum + (r.rating || 0); }, 0);
    return {
      average: Math.round((total / reviews.length) * 10) / 10,
      count: reviews.length
    };
  }

  async function markHelpful(productId, reviewId) {
    if (!productId || !reviewId) throw new Error('productId and reviewId are required');

    var fb = await getFirestoreFunctions();
    var reviewRef = fb.doc(window.db.firestore, 'products', productId, 'reviews', reviewId);
    await fb.updateDoc(reviewRef, { helpful: fb.increment(1) });
  }

  // ---- Rendering ----

  function renderStarBreakdown(reviews, container) {
    var counts = [0, 0, 0, 0, 0]; // index 0 = 1-star, index 4 = 5-star
    reviews.forEach(function(r) {
      var idx = (r.rating || 1) - 1;
      if (idx >= 0 && idx < 5) counts[idx]++;
    });

    var total = reviews.length || 1;
    var html = '<div class="star-breakdown">';
    for (var i = 4; i >= 0; i--) {
      var pct = Math.round((counts[i] / total) * 100);
      html += '<div class="breakdown-row">' +
        '<span class="breakdown-label">' + (i + 1) + ' star</span>' +
        '<div class="breakdown-bar-wrap">' +
          '<div class="breakdown-bar" style="width:' + pct + '%"></div>' +
        '</div>' +
        '<span class="breakdown-count">' + counts[i] + '</span>' +
      '</div>';
    }
    html += '</div>';
    container.innerHTML = html;
  }

  function renderAverageRating(avg, count, container) {
    var html = '<div class="rating-summary">' +
      '<div class="rating-number">' + avg + '</div>' +
      renderStarRating(Math.round(avg), false) +
      '<div class="rating-count">' + count + ' review' + (count !== 1 ? 's' : '') + '</div>' +
    '</div>';
    container.innerHTML = html;
  }

  function renderReviewList(reviews, container) {
    if (reviews.length === 0) {
      container.innerHTML = '<p class="no-reviews">No reviews yet. Be the first to share your thoughts!</p>';
      return;
    }

    var html = '<div class="reviews-list">';
    reviews.forEach(function(review) {
      html += '<div class="review-card" data-review-id="' + escapeHtml(review.id) + '">' +
        '<div class="review-header">' +
          '<span class="review-author">' + escapeHtml(review.userName || 'Anonymous') + '</span>' +
          renderStarRating(review.rating || 0, false) +
          '<span class="review-date">' + formatDate(review.createdAt) + '</span>' +
        '</div>' +
        '<p class="review-comment">' + escapeHtml(review.comment) + '</p>' +
        '<div class="review-footer">' +
          '<button class="helpful-btn" data-review-id="' + escapeHtml(review.id) + '">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
              '<path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>' +
              '<path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>' +
            '</svg>' +
            ' Helpful (' + (review.helpful || 0) + ')' +
          '</button>' +
        '</div>' +
      '</div>';
    });
    html += '</div>';
    container.innerHTML = html;
  }

  function renderReviewForm(container) {
    var html = '<div class="review-form-wrap">' +
      '<h3>Write a Review</h3>' +
      '<form id="reviewForm" class="review-form">' +
        '<div class="form-group">' +
          '<label for="reviewName">Your Name</label>' +
          '<input type="text" id="reviewName" class="form-input" placeholder="Enter your name" minlength="2" required>' +
        '</div>' +
        '<div class="form-group">' +
          '<label>Your Rating</label>' +
          '<div class="star-selector" id="starSelector">' +
            '<span class="star" data-value="1" role="button" tabindex="0" aria-label="1 star">&#9733;</span>' +
            '<span class="star" data-value="2" role="button" tabindex="0" aria-label="2 stars">&#9733;</span>' +
            '<span class="star" data-value="3" role="button" tabindex="0" aria-label="3 stars">&#9733;</span>' +
            '<span class="star" data-value="4" role="button" tabindex="0" aria-label="4 stars">&#9733;</span>' +
            '<span class="star" data-value="5" role="button" tabindex="0" aria-label="5 stars">&#9733;</span>' +
          '</div>' +
          '<input type="hidden" id="reviewRating" value="0">' +
          '<span class="form-error" id="ratingError" style="display:none;">Rating is required</span>' +
        '</div>' +
        '<div class="form-group">' +
          '<label for="reviewComment">Your Review</label>' +
          '<textarea id="reviewComment" class="form-textarea" placeholder="Share your experience (min 10 characters)" minlength="10" rows="4" required></textarea>' +
          '<span class="form-error" id="commentError" style="display:none;">Comment must be at least 10 characters</span>' +
        '</div>' +
        '<button type="submit" class="btn btn-primary" id="reviewSubmitBtn">Submit Review</button>' +
      '</form>' +
    '</div>';
    container.innerHTML = html;
  }

  // ---- Event handlers ----

  function handleStarSelector(container) {
    var stars = container.querySelectorAll('#starSelector .star');
    var hiddenInput = container.querySelector('#reviewRating');

    stars.forEach(function(star) {
      star.addEventListener('click', function() {
        var val = parseInt(this.getAttribute('data-value'), 10);
        hiddenInput.value = val;
        stars.forEach(function(s, idx) {
          if (idx < val) {
            s.classList.add('filled');
          } else {
            s.classList.remove('filled');
          }
        });
      });

      star.addEventListener('mouseenter', function() {
        var val = parseInt(this.getAttribute('data-value'), 10);
        stars.forEach(function(s, idx) {
          if (idx < val) {
            s.style.opacity = '1';
          } else {
            s.style.opacity = '0.3';
          }
        });
      });

      star.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.click();
        }
      });
    });

    container.addEventListener('mouseleave', function() {
      var currentVal = parseInt(hiddenInput.value, 10);
      stars.forEach(function(s, idx) {
        if (idx < currentVal) {
          s.style.opacity = '1';
          s.classList.add('filled');
        } else {
          s.style.opacity = '0.5';
          s.classList.remove('filled');
        }
      });
    });
  }

  function handleReviewForm(container, productId) {
    var form = container.querySelector('#reviewForm');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
      e.preventDefault();

      var nameInput = container.querySelector('#reviewName');
      var ratingInput = container.querySelector('#reviewRating');
      var commentInput = container.querySelector('#reviewComment');
      var ratingError = container.querySelector('#ratingError');
      var commentError = container.querySelector('#commentError');
      var submitBtn = container.querySelector('#reviewSubmitBtn');

      var isValid = true;

      // Validate name
      if (!nameInput.value || nameInput.value.trim().length < 2) {
        nameInput.classList.add('input-error');
        isValid = false;
      } else {
        nameInput.classList.remove('input-error');
      }

      // Validate rating
      var rating = parseInt(ratingInput.value, 10);
      if (!rating || rating < 1 || rating > 5) {
        if (ratingError) ratingError.style.display = 'inline';
        isValid = false;
      } else {
        if (ratingError) ratingError.style.display = 'none';
      }

      // Validate comment
      if (!commentInput.value || commentInput.value.trim().length < 10) {
        if (commentError) commentError.style.display = 'inline';
        commentInput.classList.add('input-error');
        isValid = false;
      } else {
        if (commentError) commentError.style.display = 'none';
        commentInput.classList.remove('input-error');
      }

      if (!isValid) {
        showToast('Please fix the errors above', 'error');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';

      try {
        await submitReview(productId, {
          userName: nameInput.value.trim(),
          rating: rating,
          comment: commentInput.value.trim()
        });

        showToast('Review submitted successfully!', 'success');
        form.reset();
        ratingInput.value = '0';
        container.querySelectorAll('#starSelector .star').forEach(function(s) {
          s.classList.remove('filled');
          s.style.opacity = '0.5';
        });

        // Reload reviews
        await loadReviews(productId);
      } catch (error) {
        console.error('Review submission failed:', error);
        showToast(error.message || 'Failed to submit review', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Review';
      }
    });
  }

  function handleHelpfulClick(container, productId) {
    container.addEventListener('click', async function(e) {
      var btn = e.target.closest('.helpful-btn');
      if (!btn) return;

      var reviewId = btn.getAttribute('data-review-id');
      if (!reviewId) return;

      btn.disabled = true;

      try {
        await markHelpful(productId, reviewId);
        showToast('Marked as helpful', 'info');
        await loadReviews(productId);
      } catch (error) {
        console.error('Failed to mark helpful:', error);
        showToast('Failed to mark as helpful', 'error');
        btn.disabled = false;
      }
    });
  }

  // ---- Load and render all reviews ----

  async function loadReviews(productId) {
    var container = document.getElementById(REVIEWS_CONTAINER_ID);
    if (!container || !productId) return;

    try {
      var reviews = await getReviews(productId);
      var avgData = await getAverageRating(productId);

      // Build layout sections
      var summaryEl = document.createElement('div');
      summaryEl.className = 'reviews-summary';
      renderAverageRating(avgData.average, avgData.count, summaryEl);

      var breakdownEl = document.createElement('div');
      breakdownEl.className = 'reviews-breakdown';
      renderStarBreakdown(reviews, breakdownEl);

      var listEl = document.createElement('div');
      listEl.className = 'reviews-list-container';
      renderReviewList(reviews, listEl);

      container.innerHTML = '<div class="reviews-header"><h2>Customer Reviews</h2></div>';
      container.appendChild(summaryEl);
      container.appendChild(breakdownEl);
      container.appendChild(listEl);

      // Re-attach helpful handlers
      handleHelpfulClick(container, productId);

      // Re-render form at the bottom
      var formWrap = document.createElement('div');
      formWrap.className = 'review-form-container';
      renderReviewForm(formWrap);
      container.appendChild(formWrap);
      handleStarSelector(container);
      handleReviewForm(container, productId);

    } catch (error) {
      console.error('Failed to load reviews:', error);
      container.innerHTML = '<p class="error">Unable to load reviews. Please try again later.</p>';
    }
  }

  // ---- Public API ----

  window.reviews = {
    submitReview: submitReview,
    getReviews: getReviews,
    getAverageRating: getAverageRating,
    markHelpful: markHelpful,
    loadReviews: loadReviews
  };

  // ---- Self-initialize ----

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      var container = document.getElementById(REVIEWS_CONTAINER_ID);
      if (container) {
        var productId = container.getAttribute('data-product-id');
        if (productId) {
          loadReviews(productId);
        } else {
          console.warn('reviews.js: reviewsContainer found but no data-product-id attribute');
        }
      }
    });
  } else {
    var container = document.getElementById(REVIEWS_CONTAINER_ID);
    if (container) {
      var productId = container.getAttribute('data-product-id');
      if (productId) {
        loadReviews(productId);
      }
    }
  }

})();
