const fs = require('fs');
const path = require('path');

const htmlSourcePath = 'C:/Users/Admin/.gemini/antigravity-ide/brain/2a754266-caa8-494c-b64b-3b28f812127a/.system_generated/steps/696/content.md';
const content = fs.readFileSync(htmlSourcePath, 'utf8');

// Find starting point: <header class="absolute
const headerStartIdx = content.indexOf('<header class="absolute');
// Find end point: before </body> or after chatbot window
const footerEndIdx = content.indexOf('<!-- Interactive Chat Window Modal -->');
const chatEndIdx = content.indexOf('</body>', footerEndIdx);

console.log('Header start index:', headerStartIdx);
console.log('Footer end index:', footerEndIdx);
console.log('Chat end index:', chatEndIdx);

if (headerStartIdx === -1 || footerEndIdx === -1) {
  console.error('Could not locate indices');
  process.exit(1);
}

const rawHtml = content.slice(headerStartIdx, chatEndIdx !== -1 ? chatEndIdx : undefined);
console.log('Extracted raw HTML length:', rawHtml.length);

fs.writeFileSync(path.join(__dirname, 'raw_sections.html'), rawHtml, 'utf8');
console.log('Saved raw_sections.html');
