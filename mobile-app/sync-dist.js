const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '../frontend/dist');
const destDir = path.resolve(__dirname, 'www');

console.log('📱 Syncing frontend build to dedicated mobile-app/www directory...');

if (!fs.existsSync(srcDir)) {
  console.error('❌ Error: frontend/dist directory does not exist. Please run "npm run build:frontend" first.');
  process.exit(1);
}

// Ensure www folder exists
if (fs.existsSync(destDir)) {
  fs.rmSync(destDir, { recursive: true, force: true });
}
fs.mkdirSync(destDir, { recursive: true });

// Copy contents recursively
function copyFolderRecursiveSync(source, target) {
  const files = fs.readdirSync(source);
  files.forEach((file) => {
    const curSource = path.join(source, file);
    const curTarget = path.join(target, file);
    if (fs.lstatSync(curSource).isDirectory()) {
      fs.mkdirSync(curTarget, { recursive: true });
      copyFolderRecursiveSync(curSource, curTarget);
    } else {
      fs.copyFileSync(curSource, curTarget);
    }
  });
}

copyFolderRecursiveSync(srcDir, destDir);
console.log('✓ Assets successfully synced to mobile-app/www!');
