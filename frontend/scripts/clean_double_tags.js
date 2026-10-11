const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'components', 'home');
const files = fs.readdirSync(dir);

files.forEach(f => {
  const filePath = path.join(dir, f);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // fix <tag ... /> </tag>
  const badTagRegex = /<([a-zA-Z0-9]+)([^>]*?)\/>\s*<\/\1>/g;
  if (badTagRegex.test(content)) {
    content = content.replace(/<([a-zA-Z0-9]+)([^>]*?)\/>\s*<\/\1>/g, '<$1$2 />');
    changed = true;
  }

  // check if there are standalone </path> or </circle> or </rect> etc
  const voidTags = ['path', 'circle', 'line', 'rect', 'polygon', 'polyline', 'img', 'input', 'br', 'hr'];
  voidTags.forEach(tag => {
    // If tag has <tag ... /> followed immediately or on next line by </tag>
    const r = new RegExp(`<${tag}([^>]*?)\\/>\\s*<\\/${tag}>`, 'g');
    if (r.test(content)) {
      content = content.replace(r, `<${tag}$1 />`);
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed double close tags in:', f);
  }
});
