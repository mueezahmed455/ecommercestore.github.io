/* eslint-env serviceworker */
(function () {
  "use strict";

  var CACHE_NAME = "dragon-tech-v1";

  var STATIC_ASSETS = [
    "/",
    "/index.html",
    "/admin.html",
    "/confirmation.html",
    "/dashboard.html",
    "/login.html",
    "/404.html",
    "/manifest.json",
    "/css/main.css",
    "/css/admin.css",
    "/css/dashboard.css",
    "/css/login.css",
    "/js/main.js",
    "/js/admin.js",
    "/js/dashboard.js",
    "/js/login.js",
    "/js/announcements.js",
    "/assets/logo.svg",
    "/assets/neon-icon.svg",
  ];

  // ---- Install: precache static assets ----
  self.addEventListener("install", function (event) {
    event.waitUntil(
      caches.open(CACHE_NAME).then(function (cache) {
        return cache
          .addAll(STATIC_ASSETS)
          .then(function () {
            return self.skipWaiting();
          })
          .catch(function (err) {
            console.warn("[SW] Precache failed for some assets:", err);
            return self.skipWaiting();
          });
      })
    );
  });

  // ---- Activate: delete old caches ----
  self.addEventListener("activate", function (event) {
    event.waitUntil(
      caches
        .keys()
        .then(function (cacheNames) {
          return Promise.all(
            cacheNames
              .filter(function (name) {
                return name !== CACHE_NAME;
              })
              .map(function (name) {
                return caches.delete(name);
              })
          );
        })
        .then(function () {
          return self.clients.claim();
        })
    );
  });

  // ---- Fetch: strategy-based caching ----
  self.addEventListener("fetch", function (event) {
    var request = event.request;
    var url = new URL(request.url);

    // Cache-first for static assets (css, js, svg, fonts, images, manifest)
    if (isStaticAsset(url.pathname)) {
      event.respondWith(cacheFirst(request));
      return;
    }

    // Network-fallback-to-cache for HTML page navigation
    if (request.mode === "navigate" || request.headers.get("accept").includes("text/html")) {
      event.respondWith(networkFallbackToCache(request));
      return;
    }

    // Default: network-fallback-to-cache
    event.respondWith(networkFallbackToCache(request));
  });

  // ---- Strategies ----

  function networkFirst(request) {
    return fetch(request)
      .then(function (response) {
        if (response.ok) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(request, clone);
          });
        }
        return response;
      })
      .catch(function () {
        return caches.match(request);
      });
  }

  function cacheFirst(request) {
    return caches.match(request).then(function (cached) {
      if (cached) return cached;
      return fetch(request).then(function (response) {
        if (response.ok) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(request, clone);
          });
        }
        return response;
      });
    });
  }

  function networkFallbackToCache(request) {
    return fetch(request)
      .then(function (response) {
        if (response.ok) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(request, clone);
          });
        }
        return response;
      })
      .catch(function () {
        return caches.match(request).then(function (cached) {
          return cached || caches.match("/index.html");
        });
      });
  }

  function isStaticAsset(pathname) {
    var staticExtensions = [
      ".css",
      ".js",
      ".svg",
      ".png",
      ".jpg",
      ".jpeg",
      ".gif",
      ".webp",
      ".ico",
      ".woff",
      ".woff2",
      ".ttf",
      ".eot",
      ".json",
      ".map",
    ];
    return staticExtensions.some(function (ext) {
      return pathname.endsWith(ext);
    });
  }
})();
