const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'app', 'homepage.css');
let css = fs.readFileSync(cssPath, 'utf8');

console.log('Original homepage.css length:', css.length);

// 1. Resolve calc(var(--spacing) * N) and calc(var(--spacing) * -N)
css = css.replace(/calc\(var\(--spacing\)\s*\*\s*(-?[\d\.]+)\)/g, (match, nStr) => {
  const n = parseFloat(nStr);
  const val = n * 0.25;
  return `${parseFloat(val.toFixed(4))}rem`;
});

// 2. Also check -calc(var(--spacing) * N)
css = css.replace(/-calc\(var\(--spacing\)\s*\*\s*([\d\.]+)\)/g, (match, nStr) => {
  const n = parseFloat(nStr);
  const val = -n * 0.25;
  return `${parseFloat(val.toFixed(4))}rem`;
});

// 3. Ensure essential bulletproof rules for Hero & Search bar & Marquee
const customFixes = `
/* ==================== BULLETPROOF CRITICAL UTILITIES ==================== */
.pl-11 {
  padding-left: 2.875rem !important; /* 46px */
}
.pr-4 {
  padding-right: 1rem !important;
}
.py-3 {
  padding-top: 0.75rem !important;
  padding-bottom: 0.75rem !important;
}
.left-3\\.5 {
  left: 0.875rem !important; /* 14px */
}

/* Category Marquee Continuous Loops */
@keyframes marqueeScrollLeft {
  0% { transform: translate3d(0, 0, 0); }
  100% { transform: translate3d(-100%, 0, 0); }
}
@keyframes marqueeScrollRight {
  0% { transform: translate3d(-100%, 0, 0); }
  100% { transform: translate3d(0, 0, 0); }
}
.category-marquee-row {
  overflow: hidden !important;
  width: 100% !important;
  display: flex !important;
  user-select: none !important;
  padding: 0.35rem 0 !important;
  position: relative !important;
}
.category-marquee-track {
  display: flex !important;
  gap: 1.15rem !important;
  padding-right: 1.15rem !important;
  flex-shrink: 0 !important;
  will-change: transform !important;
}
.category-marquee-left .category-marquee-track {
  animation: marqueeScrollLeft 38s linear infinite !important;
}
.category-marquee-right .category-marquee-track {
  animation: marqueeScrollRight 38s linear infinite !important;
}
.category-marquee-row:hover .category-marquee-track {
  animation-play-state: paused !important;
}

/* Floating Search Bar Elevation */
.hero-floating-panel {
  margin-top: -5.5rem !important;
  position: relative !important;
  z-index: 30 !important;
}
@media (min-width: 1024px) {
  .hero-floating-panel {
    margin-top: -6rem !important;
  }
}
`;

css += customFixes;

fs.writeFileSync(cssPath, css, 'utf8');
console.log('homepage.css updated successfully! New length:', css.length);

// Also sync with public/assets/css/styles.css
const publicCssPath = path.join(__dirname, '..', 'public', 'assets', 'css', 'styles.css');
fs.writeFileSync(publicCssPath, css, 'utf8');
console.log('public/assets/css/styles.css updated as well!');
