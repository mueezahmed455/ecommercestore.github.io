const fs = require('fs');
const path = require('path');

const root = __dirname;
const exts = ['.html', '.css', '.js'];

function walk(dir) {
  let files = [];
  fs.readdirSync(dir).forEach(f => {
    let p = path.join(dir, f);
    if(fs.statSync(p).isDirectory() && f !== 'node_modules' && f !== '.git' && f !== 'assets') {
      files = files.concat(walk(p));
    } else if (exts.includes(path.extname(p))) {
      files.push(p);
    }
  });
  return files;
}

const allFiles = walk(root);
allFiles.forEach(file => {
  let cnt = fs.readFileSync(file, 'utf8');
  let original = cnt;
  
  cnt = cnt.replace(/dragon-logo\.svg/g, 'dragon-logo.png');
  cnt = cnt.replace(/dragon-hero\.svg/g, 'dragon-hero.png');
  cnt = cnt.replace(/dragon-icon\.svg/g, 'dragon-icon.png');
  cnt = cnt.replace(/dragon-watermark\.svg/g, 'dragon-watermark.png');

  if(cnt !== original) {
    fs.writeFileSync(file, cnt);
  }
});
console.log("SVG replacements finished!");
