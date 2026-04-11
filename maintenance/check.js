const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dir = path.join(__dirname, 'js');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

files.forEach(f => {
  try {
    execSync(`node -c "${path.join(dir, f)}"`, {stdio: 'ignore'});
  } catch (e) {
    console.error(`SYNTAX ERROR IN: ${f}`);
  }
});
console.log("Check complete.");
