const fs = require('fs');
const path = require('path');

let html = fs.readFileSync(path.join(__dirname, 'raw_sections.html'), 'utf8');

// Replace HTML comments <!-- ... --> with {/* ... */}
html = html.replace(/<!--([\s\S]*?)-->/g, (match, p1) => {
  // escape any special characters if needed
  const cleaned = p1.replace(/\*\//g, '* /');
  return `{/*${cleaned}*/}`;
});

// Replace attribute names
html = html.replace(/\bclass="/g, 'className="');
html = html.replace(/\bfor="/g, 'htmlFor="');
html = html.replace(/\btabindex="/g, 'tabIndex="');
html = html.replace(/\bautocomplete="/g, 'autoComplete="');
html = html.replace(/\bstroke-width="/g, 'strokeWidth="');
html = html.replace(/\bstroke-linecap="/g, 'strokeLinecap="');
html = html.replace(/\bstroke-linejoin="/g, 'strokeLinejoin="');
html = html.replace(/\bclip-rule="/g, 'clipRule="');
html = html.replace(/\bfill-rule="/g, 'fillRule="');
html = html.replace(/\bstop-color="/g, 'stopColor="');
html = html.replace(/\bstop-opacity="/g, 'stopOpacity="');

// Fix self-closing void elements
const voidTags = ['img', 'input', 'br', 'hr', 'path', 'circle', 'line', 'rect', 'polygon', 'polyline', 'source'];
voidTags.forEach(tag => {
  // Regex to match <tag ...> that doesn't already end with />
  const regex = new RegExp(`<(${tag})((?:\\s+[^>]*?)?)(?<!\\/)>`, 'gi');
  html = html.replace(regex, '<$1$2 />');
});

// Convert style="display: none;" or similar simple styles into style={{ ... }}
html = html.replace(/style="([^"]*)"/g, (match, p1) => {
  const rules = p1.split(';').map(r => r.trim()).filter(Boolean);
  const styleObjProps = rules.map(rule => {
    const colonIdx = rule.indexOf(':');
    if (colonIdx === -1) return '';
    const key = rule.slice(0, colonIdx).trim().replace(/-([a-z])/g, (_, g) => g.toUpperCase());
    const val = rule.slice(colonIdx + 1).trim();
    return `${key}: '${val.replace(/'/g, "\\'")}'`;
  }).filter(Boolean);
  if (styleObjProps.length === 0) return '';
  return `style={{ ${styleObjProps.join(', ')} }}`;
});

// Fix any broken encoding artifacts like 
html = html.replace(/\s*11,499/g, '₹11,499');
html = html.replace(/\s*3,499/g, '₹3,499');
html = html.replace(/\s*18,999/g, '₹18,999');
html = html.replace(/\s*999/g, '₹999');
html = html.replace(/\s*4,299/g, '₹4,299');
html = html.replace(/\s*7,999/g, '₹7,999');
html = html.replace(/\s*24,999/g, '₹24,999');
html = html.replace(/\s*1,299/g, '₹1,299');
html = html.replace(/\s*5,499/g, '₹5,499');
html = html.replace(/~/g, '★');
html = html.replace(/o"/g, '✓');
html = html.replace(/s/g, '⚡');
html = html.replace(/dY'-\s*/g, '💑 ');
html = html.replace(/dY-\s*/g, '⭐ ');
html = html.replace(/dY\?/g, '🏷️');
html = html.replace(/dYZY/g, '🧭');
html = html.replace(/dY"z/g, '🎧');
html = html.replace(/dY`< /g, '👋 ');
html = html.replace(/dY[^\s<"]+/g, '');

// Save converted snippet to examine
fs.writeFileSync(path.join(__dirname, 'converted_jsx.jsx'), html, 'utf8');
console.log('Saved converted_jsx.jsx, size:', html.length);
