const fs = require('fs');
const path = require('path');

const rawHtml = fs.readFileSync(path.join(__dirname, 'raw_sections.html'), 'utf8');
const lines = rawHtml.split('\n');

function cleanHtmlToJsx(html) {
  // Comments
  let jsx = html.replace(/<!--([\s\S]*?)-->/g, (m, p1) => `{/*${p1.replace(/\*\//g, '* /')}*/}`);

  // Attributes
  jsx = jsx.replace(/\bclass="/g, 'className="');
  jsx = jsx.replace(/\bfor="/g, 'htmlFor="');
  jsx = jsx.replace(/\btabindex="/g, 'tabIndex="');
  jsx = jsx.replace(/\bautocomplete="/g, 'autoComplete="');
  jsx = jsx.replace(/\bstroke-width="/g, 'strokeWidth="');
  jsx = jsx.replace(/\bstroke-linecap="/g, 'strokeLinecap="');
  jsx = jsx.replace(/\bstroke-linejoin="/g, 'strokeLinejoin="');
  jsx = jsx.replace(/\bclip-rule="/g, 'clipRule="');
  jsx = jsx.replace(/\bfill-rule="/g, 'fillRule="');
  jsx = jsx.replace(/\bstop-color="/g, 'stopColor="');
  jsx = jsx.replace(/\bstop-opacity="/g, 'stopOpacity="');

  // Void tags self-close
  const voidTags = ['img', 'input', 'br', 'hr', 'path', 'circle', 'line', 'rect', 'polygon', 'polyline', 'source'];
  voidTags.forEach(tag => {
    const regex = new RegExp(`<(${tag})((?:\\s+[^>]*?)?)(?<!\\/)>`, 'gi');
    jsx = jsx.replace(regex, '<$1$2 />');
  });

  // Styles
  jsx = jsx.replace(/style="([^"]*)"/g, (match, p1) => {
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

  // Clean corrupted character marks from scraper
  jsx = jsx.replace(/Ã¢â‚¬â„¢/g, "'");
  jsx = jsx.replace(/Ã¢â‚¬â€/g, "—");
  jsx = jsx.replace(/Ã¢â‚¬â€œ/g, "–");
  jsx = jsx.replace(/Ã¢â‚¬Â¢/g, "•");
  jsx = jsx.replace(/Ã¢â‚¬Å“/g, '"');
  jsx = jsx.replace(/Ã¢â‚¬Â/g, '"');
  jsx = jsx.replace(/Â/g, "");
  jsx = jsx.replace(/â€¢/g, "•");
  jsx = jsx.replace(/â€”/g, "—");
  jsx = jsx.replace(/â€“/g, "–");
  jsx = jsx.replace(/âœ"/g, "✓");
  jsx = jsx.replace(/âœ/g, "✓");
  jsx = jsx.replace(/âš¡/g, "⚡");
  jsx = jsx.replace(/â­/g, "★");
  jsx = jsx.replace(/â­/g, "★");
  jsx = jsx.replace(/â‚¹/g, "₹");
  jsx = jsx.replace(/ðŸ‘‹/g, "👋");
  jsx = jsx.replace(/ðŸ‘«/g, "💑");
  jsx = jsx.replace(/ðŸ/g, "🏷️");
  jsx = jsx.replace(/ðŸ🧭/g, "🧭");
  jsx = jsx.replace(/ðŸ”§/g, "🎧");
  jsx = jsx.replace(/ðŸ[^\s<"]+/g, "");

  // Replace static href="#" with role handlers where applicable
  jsx = jsx.replace(/href="#"/g, 'href="#!"');

  return jsx;
}

// Slice sections based on known lines
// 288-796: Category Slider
const catHtml = lines.slice(287, 796).join('\n');
// 797-949: Destinations
const destHtml = lines.slice(796, 949).join('\n');
// 950-1226: Trending Experiences (Bento)
const trendHtml = lines.slice(949, 1226).join('\n');
// 1227-1418: AI Trip Planner
const aiHtml = lines.slice(1226, 1418).join('\n');
// 1419-1602: Why Book
const whyHtml = lines.slice(1418, 1602).join('\n');
// 1603-2009: Collections ("Handpicked Experiences for You")
const colHtml = lines.slice(1602, 2009).join('\n');
// 2010-2265: Offers ("Exclusive Deals and Offers")
const offHtml = lines.slice(2009, 2265).join('\n');
// 2266-2748: Testimonials
const testHtml = lines.slice(2265, 2748).join('\n');
// 2749-2852: Partner Promos
const partHtml = lines.slice(2748, 2852).join('\n');
// 2853-3022: App Showcase
const appHtml = lines.slice(2852, 3022).join('\n');
// 3023-3128: Newsletter
const newsHtml = lines.slice(3022, 3128).join('\n');
// 3129 to footer end: Studio Footer
const footEndIdx = lines.findIndex((l, i) => i > 3128 && l.includes('</footer>'));
const footHtml = lines.slice(3128, footEndIdx !== -1 ? footEndIdx + 1 : 3300).join('\n');

const componentsDir = path.join(__dirname, '..', 'components', 'home');
if (!fs.existsSync(componentsDir)) {
  fs.mkdirSync(componentsDir, { recursive: true });
}

// 1. CategoryMarquee.js
fs.writeFileSync(path.join(componentsDir, 'CategoryMarquee.js'), `'use client';
export default function CategoryMarquee({ onSelectCategory }) {
  return (
${cleanHtmlToJsx(catHtml)}
  );
}
`, 'utf8');

// 2. PopularDestinations.js
fs.writeFileSync(path.join(componentsDir, 'PopularDestinations.js'), `'use client';
export default function PopularDestinations({ onSelectDestination }) {
  return (
${cleanHtmlToJsx(destHtml)}
  );
}
`, 'utf8');

// 3. TrendingExperiences.js
fs.writeFileSync(path.join(componentsDir, 'TrendingExperiences.js'), `'use client';
export default function TrendingExperiences({ onBookExperience }) {
  return (
${cleanHtmlToJsx(trendHtml)}
  );
}
`, 'utf8');

// 4. AiTripPlanner.js
fs.writeFileSync(path.join(componentsDir, 'AiTripPlanner.js'), `'use client';
export default function AiTripPlanner({ onPlanTrip }) {
  return (
${cleanHtmlToJsx(aiHtml)}
  );
}
`, 'utf8');

// 5. WhyBookSection.js
fs.writeFileSync(path.join(componentsDir, 'WhyBookSection.js'), `'use client';
export default function WhyBookSection() {
  return (
${cleanHtmlToJsx(whyHtml)}
  );
}
`, 'utf8');

// 6. HandpickedCollections.js
fs.writeFileSync(path.join(componentsDir, 'HandpickedCollections.js'), `'use client';
export default function HandpickedCollections({ onSelectCollection }) {
  return (
${cleanHtmlToJsx(colHtml)}
  );
}
`, 'utf8');

// 7. ExclusiveOffers.js
fs.writeFileSync(path.join(componentsDir, 'ExclusiveOffers.js'), `'use client';
export default function ExclusiveOffers({ onCopyCode, onClaimOffer }) {
  return (
${cleanHtmlToJsx(offHtml)}
  );
}
`, 'utf8');

// 8. ClientTestimonials.js
fs.writeFileSync(path.join(componentsDir, 'ClientTestimonials.js'), `'use client';
export default function ClientTestimonials() {
  return (
${cleanHtmlToJsx(testHtml)}
  );
}
`, 'utf8');

// 9. PartnerPromos.js
fs.writeFileSync(path.join(componentsDir, 'PartnerPromos.js'), `'use client';
export default function PartnerPromos({ onBecomeSupplier, onBecomePartner }) {
  return (
${cleanHtmlToJsx(partHtml)}
  );
}
`, 'utf8');

// 10. AppShowcase.js
fs.writeFileSync(path.join(componentsDir, 'AppShowcase.js'), `'use client';
export default function AppShowcase({ onNotifyMe }) {
  return (
${cleanHtmlToJsx(appHtml)}
  );
}
`, 'utf8');

// 11. NewsletterSection.js
fs.writeFileSync(path.join(componentsDir, 'NewsletterSection.js'), `'use client';
export default function NewsletterSection({ onSubscribe }) {
  return (
${cleanHtmlToJsx(newsHtml)}
  );
}
`, 'utf8');

// 12. StudioFooter.js
fs.writeFileSync(path.join(componentsDir, 'StudioFooter.js'), `'use client';
export default function StudioFooter({ onOpenAuth }) {
  return (
${cleanHtmlToJsx(footHtml)}
  );
}
`, 'utf8');

console.log('All 12 home components generated successfully in components/home/!');
