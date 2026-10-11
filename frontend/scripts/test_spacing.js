const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'app', 'homepage.css');
let css = fs.readFileSync(cssPath, 'utf8');

console.log('Original CSS length:', css.length);

// 1. Resolve calc(var(--spacing) * N) and calc(var(--spacing) * -N)
css = css.replace(/calc\(var\(--spacing\)\s*\*\s*(-?[\d\.]+)\)/g, (match, nStr) => {
  const n = parseFloat(nStr);
  const val = n * 0.25;
  // format cleanly (e.g. 2.75rem, 0.875rem)
  return `${parseFloat(val.toFixed(4))}rem`;
});

// 2. Also check -calc(var(--spacing) * N)
css = css.replace(/-calc\(var\(--spacing\)\s*\*\s*([\d\.]+)\)/g, (match, nStr) => {
  const n = parseFloat(nStr);
  const val = -n * 0.25;
  return `${parseFloat(val.toFixed(4))}rem`;
});

// 3. Remove @layer declarations
css = css.replace(/@layer\s+properties\s*;/g, '');
css = css.replace(/@layer\s+theme,\s*base,\s*components,\s*utilities\s*;/g, '');
css = css.replace(/@layer\s+theme\s*\{/g, '');
css = css.replace(/@layer\s+base\s*\{/g, '');
css = css.replace(/@layer\s+components\s*\{/g, '');
css = css.replace(/@layer\s+utilities\s*\{/g, '');

// Since we removed 3-4 opening braces from @layer, we need to remove their corresponding closing braces.
// In Tailwind v4 compiled CSS, @layer blocks enclose sections.
// Rather than guessing which closing brace belongs to @layer, let's look at the structure of Tailwind v4 CSS.

fs.writeFileSync(path.join(__dirname, 'test_resolved.css'), css, 'utf8');
console.log('Saved test_resolved.css');
