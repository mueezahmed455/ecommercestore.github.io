const fs = require('fs');
const path = require('path');

// 1. Upgrade i18n.js interpreter to respect innerHTML
let i18nPath = path.join(__dirname, 'js', 'i18n.js');
let i18n = fs.readFileSync(i18nPath, 'utf8');

// Replace standard textContent binding with innerHTML so spans/breaks survive
i18n = i18n.replace(/\} else \{\s*textEls\[i\]\.textContent = translated;\s*\}/, `} else {
        textEls[i].innerHTML = translated;
      }`);

// We need to update the English dictionary in i18n to match their newly typed text
i18n = i18n.replace(/hero_title:\s*'[^']+'/, "hero_title: '<span class=\"gradient-text\">Technology, Curated</span><br><span>for Excellence</span>'");
i18n = i18n.replace(/hero_subtitle:\s*'[^']+'/, "hero_subtitle: 'Premium devices and accessories for professionals who demand performance, reliability, and refined design.'");
i18n = i18n.replace(/products_title:\s*'[^']+'/, "products_title: 'Featured Products'");
i18n = i18n.replace(/newsletter_title:\s*'[^']+'/, "newsletter_title: 'Stay Updated'");
i18n = i18n.replace(/footer_text:\s*'[^']+'/, "footer_text: '&copy; 2026 Dragon-Tech. Premium technology for professionals.'");
// Wipe the repeated trailing keys without breaking syntax
i18n = i18n.replace(/newsletter_placeholder:[^}]+(?=\})/g, `newsletter_placeholder: 'your@email.com',
      newsletter_submit: 'Subscribe',
      announcement_dismiss: 'Dismiss',
      remove_item: 'Remove'
    `);
fs.writeFileSync(i18nPath, i18n);

// 2. Add data-i18n attributes natively into the new index.html headers
let htmlPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');
html = html.replace(/<h1 class="hero-title">/, '<h1 class="hero-title" data-i18n="hero_title">');
html = html.replace(/<p class="hero-subtitle"[^>]*>.*?<\/p>/, '<p class="hero-subtitle" data-i18n="hero_subtitle">Premium devices and accessories for professionals who demand performance, reliability, and refined design.</p>');
fs.writeFileSync(htmlPath, html);

// 3. Upgrade Backend Feature: Products JSON
// To make Mystery Box work backend-wise, let's inject it as a real product entity
let prodPath = path.join(__dirname, 'js', 'products.js');
if (fs.existsSync(prodPath)) {
  let pData = fs.readFileSync(prodPath, 'utf8');
  if(!pData.includes("'mystery-box'")) {
    let mysteryData = `{
      id: 'mystery-box',
      name: 'Dragon\\'s Mystery Hoard #042',
      price: 49.00,
      image: 'assets/dragon-logo.png',
      category: 'accessories',
      description: 'A guaranteed $100+ value tech bundle including at least 1 rare/premium accessory. Final sale.',
      rating: 5.0,
      reviewsCount: 128
    },`;
    pData = pData.replace(/var\s*PRODUCTS\s*=\s*\[/, `var PRODUCTS = [\n    ${mysteryData}`);
    fs.writeFileSync(prodPath, pData);
  }
}

// 4. Hook up the JS logic on Mystery Box
html = fs.readFileSync(htmlPath, 'utf8');
html = html.replace(/onclick="window\.showToast\('Added Mystery Box to Cart!', 'success'\)"/, `onclick="if(window.cart) window.cart.addToCart('mystery-box'); window.showToast('Mystery Hoard Secured!', 'success');"`);
fs.writeFileSync(htmlPath, html);

console.log("Language and Backend upgrades successful.");
