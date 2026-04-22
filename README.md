# 🐉 Dragon-Tech

**Premium. Secure. Intelligent.**
*A high-performance e-commerce ecosystem built for the modern technology minimalist.*

---

## 💎 The Vision

Dragon-Tech is more than an e-commerce platform—it's a curated experience designed to bridge the gap between luxury aesthetics and technical performance. Every module is engineered for absolute data integrity and zero-latency user interaction.

## 🚀 Core Pillars

- **Unrivaled Performance**: Optimized ES6+ modular architecture ensuring instant page loads and fluid 60FPS UI transitions.
- **Hardened Local-First**: Fully decentralized architecture with advanced client-side security, including price validation and tamper-evident data seals.
- **Luxury Security**: Integrated encryption for local data persistence and secure session management.
- **Glassmorphic UI**: Premium aesthetics with interactive particle backgrounds and fluid animations.

## 🔐 Advanced Security (v2.1)

Dragon-Tech now features a hardened security model designed for robust protection in a serverless environment:

- **Enhanced Password Security**: Upgraded from simple hashing to a high-iteration (1000+ pass) computationally expensive hashing process with local peppers.
- **Order Integrity Engine**: All transactions are re-validated against the original product catalog upon save. Price manipulation in the client console is automatically detected and corrected.
- **Tamper-Evident Seals**: Orders are stored with a unique cryptographic "seal" to detect manual LocalStorage manipulation.
- **Strict Authorization Guard**: Admin access is verified against both role-based and UID-based identity tokens, preventing role-spoofing via browser console.
- **Universal XSS Hardening**: Comprehensive audit and sanitization of all user-generated content (reviews, user names, emails) using strict escaping and `textContent` rendering.

## ⚡ Performance Hardening (v2.2)

Engineered for 100/100 Lighthouse scores on both Mobile and Desktop:

- **Intelligent Resource Management**: Implementation of `content-visibility: auto` and `contain-intrinsic-size` for heavy off-screen sections.
- **Battery-Aware Animations**: Particle systems and atmospheric orbs automatically pause when the tab is hidden or "Reduced Motion" is enabled.
- **Adaptive Rendering**: Particle counts and effects scale dynamically based on device performance and screen size.
- **A11y Optimized**: Full support for `prefers-reduced-motion` and `prefers-reduced-transparency` media queries.
- **Critical Path Optimization**: Font-loading strategy using `font-display: swap` and layout shift (CLS) prevention via explicit aspect ratios.

## 🛠️ Technical Fabric

- **Frontend**: Vanilla JavaScript / HTML5 / CSS3 (Glassmorphism architecture)
- **Data Architecture**: Local-First Persistence (LocalStorage Service)
- **Payments**: Simulated Secure Checkout
- **Assets**: 8K AI-Generated High-Fidelity Graphics

## 📁 Project Architecture

```text
├── assets/         # 8K Digital Art & Branding Assets
├── css/            # Glassmorphic Design System
├── js/             # Modular Logic (Auth, Cart, Storage, i18n)
├── pages/          # Authentication & Dashboard Views
└── index.html      # Main Discovery Platform
```

## 🔐 Local-Only Execution

The platform is designed to run entirely in the browser. No server or cloud infrastructure is required.

```bash
# Simply open index.html in any modern web browser
# Or use a local development server
npx serve .
```

---

<div align="center">
  <sub>Licensed under MIT.</sub>
</div>
