/**
 * Dragon-Tech Reviews Module — v2.0 (Local-Only stub)
 * All review logic is now handled within product-modal.js.
 * This file kept for backward compatibility with any page that loads it.
 */
(function () {
  'use strict';

  var REVIEWS_KEY_PREFIX = 'dt_reviews_';

  function getReviews(productId) {
    try { return JSON.parse(localStorage.getItem(REVIEWS_KEY_PREFIX + productId) || '[]'); } catch (e) { return []; }
  }

  function saveReview(productId, review) {
    var reviews = getReviews(productId);
    var user = window.storage ? window.storage.getCurrentUser() : null;
    if (!user) throw new Error('Must be signed in to review');
    if (!review.rating || review.rating < 1 || review.rating > 5) throw new Error('Invalid rating');
    if (!review.text || review.text.trim().length < 10) throw new Error('Review too short');

    var newReview = {
      id:      'rev_' + Date.now(),
      author:  user.name || 'Anonymous',
      userId:  user.uid,
      rating:  review.rating,
      text:    review.text.trim(),
      helpful: 0,
      date:    new Date().toISOString()
    };
    reviews.unshift(newReview);
    try { localStorage.setItem(REVIEWS_KEY_PREFIX + productId, JSON.stringify(reviews)); } catch (e) {}
    return newReview;
  }

  function getAvgRating(productId) {
    var reviews = getReviews(productId);
    if (!reviews.length) return 0;
    return reviews.reduce(function (s, r) { return s + r.rating; }, 0) / reviews.length;
  }

  window.reviews = {
    getReviews: getReviews,
    saveReview: saveReview,
    getAvgRating: getAvgRating
  };

})();
