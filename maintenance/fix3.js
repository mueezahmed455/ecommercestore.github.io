const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function fix(f, badRegex, goodStr) {
  let p = path.join(__dirname, 'js', f);
  let cnt = fs.readFileSync(p, 'utf8');
  fs.writeFileSync(p, cnt.replace(badRegex, goodStr));
}

// Fix product-modal.js
fix('product-modal.js', /function\s*showToast\([\s\S]*?setTimeout\(function\(\)\s*\{\s*toast\.classList\.remove\('show'\);\s*\}/, '');

// Fix referral.js
fix('referral.js', /function\s*showToast\([\s\S]*?setTimeout\(function\(\)\s*\{\s*toast\.classList\.remove\('show'\);\s*\}/, '');

// Fix i18n
let i18Path = path.join(__dirname, 'js', 'i18n.js');
let icnt = fs.readFileSync(i18Path, 'utf8');
icnt = icnt.replace(/remove_item:\s*'([^']+)'\r?\n(\s+)newsletter_placeholder/g, "remove_item: '$1',\n$2newsletter_placeholder");
fs.writeFileSync(i18Path, icnt);

const dir = path.join(__dirname, 'js');
['i18n.js', 'product-modal.js', 'referral.js'].forEach(f => {
  try {
    execSync(`node -c "${path.join(dir, f)}"`, {stdio: 'ignore'});
    console.log(`OK: ${f}`);
  } catch(e) {
    console.error(`STILL ERR: ${f}`);
  }
});
