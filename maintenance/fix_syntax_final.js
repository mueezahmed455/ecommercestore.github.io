const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function rep(file, regex, replaceWith) {
  const p = path.join(__dirname, 'js', file);
  if (!fs.existsSync(p)) return;
  let cnt = fs.readFileSync(p, 'utf8');
  cnt = cnt.replace(regex, replaceWith);
  fs.writeFileSync(p, cnt);
}

// ui.js
rep('ui.js', /window\.showToast = function[\s\S]*?\};\s*$/m, '');

// reviews.js
rep('reviews.js', /\s*else\s*\{\s*console\.log\('\[.*\] ' \+ message\);\s*\}\s*\}/, '');

// product-modal.js
rep('product-modal.js', /,\s*3000\);\s*\}/g, '');
rep('product-modal.js', /setTimeout\(function\(\) \{ toast\.classList\.remove\('show'\); \};\s*/g, '');

// referral.js
rep('referral.js', /,\s*3000\);\s*\}/g, '');
rep('referral.js', /setTimeout\(function\(\) \{ toast\.classList\.remove\('show'\); \};\s*/g, '');

// i18n.js (fixing missing comma)
rep('i18n.js', /remove_item:\s*'([^']+)'(\s+)announcement_dismiss/g, "remove_item: '$1',$2announcement_dismiss");
// Just in case it duplicated entirely
rep('i18n.js', /remove_item:\s*'([^']+)'\s+announcement_dismiss:\s*'([^']+)',\s+remove_item:\s*'([^']+)'/g, "remove_item: '$1'");

const dir = path.join(__dirname, 'js');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
let hasError = false;
files.forEach(f => {
  try {
    execSync(`node -c "${path.join(dir, f)}"`, {stdio: 'ignore'});
  } catch (e) {
    console.error(`ERROR IN: ${f}`);
    hasError = true;
  }
});

if(!hasError) console.log("ALL FILES FIXED AND CLEAN!");
