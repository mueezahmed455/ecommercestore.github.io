(function() {
  'use strict';

  var VideoShowcase = {
    videos: {
      'prod_001': { videoUrl: 'https://example.com/videos/earbuds.mp4', thumbnail: null },
      'prod_002': { videoUrl: 'https://example.com/videos/speaker.mp4', thumbnail: null },
      'prod_003': { videoUrl: 'https://example.com/videos/headset.mp4', thumbnail: null },
      'prod_005': { videoUrl: 'https://example.com/videos/watch.mp4', thumbnail: null },
      'prod_007': { videoUrl: 'https://example.com/videos/laptop.mp4', thumbnail: null }
    },
    activeVideo: null,

    init: function() {
      this.createVideoGallery();
    },

    createVideoGallery: function() {
      var section = document.createElement('section');
      section.id = 'videoShowcaseSection';
      section.className = 'video-showcase-section';
      section.innerHTML =
        '<div class="container">' +
          '<div class="section-header">' +
            '<p class="section-eyebrow">See In Action</p>' +
            '<h2 class="section-title">Product Videos</h2>' +
            '<p class="section-sub">Watch demos and unboxing</p>' +
          '</div>' +
          '<div class="video-grid" id="videoGrid"></div>' +
        '</div>' +
        '<div class="video-modal" id="videoModal">' +
          '<div class="video-modal-content">' +
            '<button class="video-modal-close">&times;</button>' +
            '<video id="showcaseVideo" controls></video>' +
          '</div>' +
        '</div>';
      document.body.appendChild(section);
      this.renderVideos(section);
    },

    renderVideos: function(section) {
      var grid = section.querySelector('#video-grid');
      if (!grid || !window.PRODUCTS) return;

      var self = this;
      var featuredWithVideo = window.PRODUCTS.filter(function(p) {
        return self.videos[p.id];
      }).slice(0, 4);

      if (!featuredWithVideo.length) return;

      grid.innerHTML = featuredWithVideo.map(function(p) {
        var v = self.videos[p.id];
        return '<div class="video-card" data-id="' + p.id + '">' +
          '<div class="video-thumbnail">' +
            '<img src="' + (v.thumbnail || p.image) + '" alt="' + p.name + '">' +
            '<div class="video-play-btn">' +
              '<svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">' +
                '<polygon points="5 3 19 12 5 21 5 3"/>' +
              '</svg>' +
            '</div>' +
            '<span class="video-badge">VIDEO</span>' +
          '</div>' +
          '<div class="video-info">' +
            '<h3>' + p.name + '</h3>' +
          '</div>' +
        '</div>';
      }).join('');

      grid.querySelectorAll('.video-card').forEach(function(card) {
        card.addEventListener('click', function() {
          var id = card.dataset.id;
          self.playVideo(id);
        });
      });
    },

    playVideo: function(productId) {
      var videoData = this.videos[productId];
      if (!videoData) return;

      var modal = document.getElementById('videoModal');
      var video = document.getElementById('showcaseVideo');
      if (!modal || !video) return;

      this.activeVideo = productId;
      video.src = videoData.videoUrl;
      video.poster = videoData.thumbnail || window.getProductById(productId).image;
      modal.classList.add('open');
      video.play();

      var self = this;
      modal.querySelector('.video-modal-close').addEventListener('click', function() {
        self.closeVideo();
      });
    },

    closeVideo: function() {
      var modal = document.getElementById('videoModal');
      var video = document.getElementById('showcaseVideo');
      if (modal) modal.classList.remove('open');
      if (video) {
        video.pause();
        video.src = '';
      }
    },

    hasVideo: function(productId) {
      return !!this.videos[productId];
    },

    getVideoButton: function(productId) {
      if (!this.hasVideo(productId)) return '';

      var btn = document.createElement('button');
      btn.className = 'btn btn-outline btn-sm video-btn';
      btn.innerHTML =
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">' +
          '<polygon points="5 3 19 12 5 21 5 3"/>' +
        '</svg> Watch Demo';
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        VideoShowcase.playVideo(productId);
      });
      return btn;
    }
  };

  window.VideoShowcase = VideoShowcase;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { VideoShowcase.init(); });
  } else { VideoShowcase.init(); }

})();