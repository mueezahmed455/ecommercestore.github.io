(function () {
  "use strict";

  window.announcements = (function () {
    let initialized = false;

    // Default local announcement
    const DEFAULT_ANNOUNCEMENT = {
      active: true,
      message: "Welcome to the new Dragon-Tech experience! Free shipping on all orders over $50.",
      expiresAt: "2026-12-31T23:59:59Z"
    };

    function hashString(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0;
      }
      return hash.toString(16);
    }

    function isDismissed(messageHash) {
      return localStorage.getItem("dragon_dismissed_announcement") === messageHash;
    }

    function markDismissed(messageHash) {
      localStorage.setItem("dragon_dismissed_announcement", messageHash);
    }

    function renderBanner(message) {
      const existing = document.querySelector(".announcement-banner");
      if (existing) return;

      const esc = (window.utils && window.utils.escapeHtml) ? window.utils.escapeHtml : (s) => s;
      const banner = document.createElement("div");
      banner.className = "announcement-banner";
      banner.setAttribute("role", "alert");
      banner.innerHTML =
        '<span class="announcement-message">' +
        esc(message) +
        "</span>" +
        '<button class="announcement-dismiss" aria-label="Dismiss announcement">&times;</button>';

      const style = document.createElement("style");
      style.textContent =
        ".announcement-banner {" +
        "  position: relative;" +
        "  top: 0;" +
        "  left: 0;" +
        "  width: 100%;" +
        "  z-index: 10000;" +
        "  background: linear-gradient(90deg, #00d4ff, #b400ff, #ff006a);" +
        "  color: #ffffff;" +
        "  text-align: center;" +
        "  padding: 12px 48px 12px 16px;" +
        "  font-family: inherit;" +
        "  font-size: 14px;" +
        "  line-height: 1.5;" +
        "  box-sizing: border-box;" +
        "  display: flex;" +
        "  align-items: center;" +
        "  justify-content: center;" +
        "  box-shadow: 0 2px 12px rgba(0, 212, 255, 0.3);" +
        "}" +
        ".announcement-banner .announcement-message {" +
        "  flex: 1;" +
        "  padding-right: 16px;" +
        "}" +
        ".announcement-banner .announcement-dismiss {" +
        "  position: absolute;" +
        "  right: 12px;" +
        "  top: 50%;" +
        "  transform: translateY(-50%);" +
        "  background: none;" +
        "  border: none;" +
        "  color: #ffffff;" +
        "  font-size: 24px;" +
        "  cursor: pointer;" +
        "  padding: 0 8px;" +
        "  line-height: 1;" +
        "  opacity: 0.85;" +
        "  transition: opacity 0.2s;" +
        "}" +
        ".announcement-banner .announcement-dismiss:hover {" +
        "  opacity: 1;" +
        "}" +
        ".announcement-banner.dismissing {" +
        "  animation: announcementSlideUp 0.3s ease forwards;" +
        "}" +
        "@keyframes announcementSlideUp {" +
        "  from { opacity: 1; transform: translateY(0); max-height: 80px; }" +
        "  to   { opacity: 0; transform: translateY(-100%); max-height: 0; padding: 0; margin: 0; }" +
        "}";

      document.head.appendChild(style);

      const messageHash = hashString(message);
      banner.querySelector(".announcement-dismiss").addEventListener("click", function () {
        banner.classList.add("dismissing");
        banner.addEventListener("animationend", function () {
          banner.remove();
          markDismissed(messageHash);
        });
      });

      const body = document.body;
      if (body.firstChild) {
        body.insertBefore(banner, body.firstChild);
      } else {
        body.appendChild(banner);
      }
    }

    async function init() {
      if (initialized) return;
      initialized = true;

      try {
        // Use local config instead of Firestore
        const data = DEFAULT_ANNOUNCEMENT;
        if (!data || !data.active) return;

        if (data.expiresAt) {
          const expiresAt = new Date(data.expiresAt);
          if (Date.now() > expiresAt.getTime()) return;
        }

        const message = data.message;
        if (!message) return;

        const messageHash = hashString(message);
        if (isDismissed(messageHash)) return;

        renderBanner(message);
      } catch (err) {
        console.warn("[announcements] Failed to initialize announcement:", err);
      }
    }

    return {
      init: init,
      renderBanner: renderBanner,
    };
  })();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      window.announcements.init();
    });
  } else {
    window.announcements.init();
  }
})();
