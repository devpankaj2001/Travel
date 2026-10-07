const fs = require('fs');
const path = require('path');
const https = require('https');

const content = fs.readFileSync('C:/Users/Admin/.gemini/antigravity-ide/brain/2a754266-caa8-494c-b64b-3b28f812127a/.system_generated/steps/696/content.md', 'utf8');
const regex = /src=["'](assets\/[^"']+)["']/g;
let match;
const assetPaths = new Set();
while ((match = regex.exec(content)) !== null) {
  assetPaths.add(match[1]);
}

console.log('Found assets count:', assetPaths.size);
const assetsList = Array.from(assetPaths);
console.log(assetsList);

const baseUrl = 'https://bookingplatform-two.vercel.app/';

function downloadFile(relPath) {
  return new Promise((resolve) => {
    const destPath = path.join(__dirname, '..', 'public', relPath);
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    const fileUrl = baseUrl + relPath;
    const file = fs.createWriteStream(destPath);

    https.get(fileUrl, (res) => {
      if (res.statusCode === 200) {
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log('Downloaded:', relPath);
          resolve(true);
        });
      } else {
        console.error('Failed to download (' + res.statusCode + '):', fileUrl);
        file.close();
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        resolve(false);
      }
    }).on('error', (err) => {
      console.error('Error downloading:', fileUrl, err.message);
      file.close();
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      resolve(false);
    });
  });
}

(async () => {
  for (const p of assetsList) {
    await downloadFile(p);
  }
  console.log('All downloads finished!');
})();
