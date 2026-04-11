const fs = require('fs');
const path = require('path');

const jsFiles = ['cart.js', 'products.js', 'reviews.js', 'wishlist.js', 'auth.js', 'dashboard.js', 'admin.js', 'ui.js', 'referral.js', 'product-modal.js'];
jsFiles.forEach(file => {
  const p = path.join(__dirname, 'js', file);
  if (fs.existsSync(p)) {
    let cnt = fs.readFileSync(p, 'utf8');
    // For previously failed showToast removals, remove the specific hanging syntax
    cnt = cnt.replace(/,\s*3000\);\s*\}/g, '');
    fs.writeFileSync(p, cnt);
  }
});

// Fix i18n
const i18nPath = path.join(__dirname, 'js', 'i18n.js');
let i18nHTML = fs.readFileSync(i18nPath, 'utf8');
i18nHTML = i18nHTML.replace(/remove_item: 'Remove'\s*announcement_dismiss: 'Dismiss',\s*remove_item: 'Remove'/g, "remove_item: 'Remove'");
// Wait, they might be translated differently? Let's aggressively replace any missing comma before annoucement_dismiss
i18nHTML = i18nHTML.replace(/remove_item: '([^']+)'\s+announcement_dismiss: '([^']+)',\s+remove_item: '([^']+)'/g, "remove_item: '$1'");
fs.writeFileSync(i18nPath, i18nHTML);

// Fix newsletter
const nlPath = path.join(__dirname, 'js', 'newsletter.js');
let nlHTML = fs.readFileSync(nlPath, 'utf8');
nlHTML = nlHTML.replace(/else\s*\{\s*console\.log\('\[' \+ \(type \|\| 'info'\) \+ '\] ' \+ message\);\s*\}\s*\}/g, '');
fs.writeFileSync(nlPath, nlHTML);

console.log("Syntax fixed. Validating...");
const { execSync } = require('child_process');
const dir = path.join(__dirname, 'js');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
let hasError = false;
files.forEach(f => {
  try {
    execSync(`node -c "${path.join(dir, f)}"`, {stdio: 'ignore'});
  } catch (e) {
    console.error(`STILL ERROR IN: ${f}`);
    hasError = true;
  }
});
if(!hasError) console.log("ALL FILES OK");
