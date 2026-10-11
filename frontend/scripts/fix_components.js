const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'components', 'home');
const files = fs.readdirSync(dir);

files.forEach(f => {
  const filePath = path.join(dir, f);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // replace src="assets/ with src="/assets/
  if (content.includes('src="assets/')) {
    content = content.replace(/src="assets\//g, 'src="/assets/');
    changed = true;
  }
  // replace poster="assets/ with poster="/assets/
  if (content.includes('poster="assets/')) {
    content = content.replace(/poster="assets\//g, 'poster="/assets/');
    changed = true;
  }
  // replace copyPromoCode onclicks
  if (content.includes('onclick="copyPromoCode')) {
    content = content.replace(/onclick="copyPromoCode\(this,\s*'([^']+)'\)"/g, "onClick={() => onCopyCode && onCopyCode('$1')}");
    changed = true;
  }
  // replace window.scrollTo onclick
  if (content.includes('onclick="window.scrollTo')) {
    content = content.replace(/onclick="window\.scrollTo[^"]*"/g, "onClick={() => { if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' }); }}");
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed:', f);
  }
});
