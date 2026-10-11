async function check() {
  const res = await fetch('http://localhost:3001/');
  const text = await res.text();
  const cssMatches = text.match(/href="([^"]+\.css[^"]*)"/g);
  console.log('CSS links found in HTML:', cssMatches);
  if (cssMatches) {
    for (const link of cssMatches) {
      const cleanPath = link.replace('href="', '').replace('"', '');
      const fullUrl = cleanPath.startsWith('http') ? cleanPath : 'http://localhost:3001' + cleanPath;
      const cssRes = await fetch(fullUrl);
      const cssContent = await cssRes.text();
      console.log('Fetched:', fullUrl);
      console.log('Status:', cssRes.status, 'Length:', cssContent.length);
      console.log('Sample content:', cssContent.substring(0, 200));
    }
  }
}
check().catch(console.error);
