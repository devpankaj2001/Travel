const fs = require('fs');
const path = require('path');
const { transform } = require('next/dist/build/swc');

const dir = path.join(__dirname, '..', 'components', 'home');
const files = fs.readdirSync(dir);

async function cleanAndValidate() {
  for (const f of files) {
    if (f === 'HeroHeaderSection.js' || f === 'AiChatbotWidget.js') continue;
    const filePath = path.join(dir, f);
    let code = fs.readFileSync(filePath, 'utf8');

    // 1. Remove any <script>...</script> tags
    code = code.replace(/<script[\s\S]*?<\/script>/gi, '');

    // 2. Fix broken comments like <!- ... -> or <!-- ...
    code = code.replace(/<!-[\s\S]*?->/g, (m) => `{/* ${m.replace(/[<!>\-]/g, ' ').trim()} */}`);
    code = code.replace(/<!--[\s\S]*?-->/g, (m) => `{/* ${m.replace(/[<!>\-]/g, ' ').trim()} */}`);
    code = code.replace(/<!--[\s\S]*/g, '');

    // 3. Trim anything after the closing </section> or </footer>
    const lastSectionIdx = Math.max(code.lastIndexOf('</section>'), code.lastIndexOf('</footer>'));
    if (lastSectionIdx !== -1) {
      const tagEnd = code.indexOf('>', lastSectionIdx);
      const before = code.slice(0, tagEnd + 1);
      code = `${before}\n  );\n}\n`;
    }

    // 4. Ensure properly wrapped in return ( ... )
    fs.writeFileSync(filePath, code, 'utf8');

    // 5. Test compile with Next SWC
    try {
      await transform(code, {
        jsc: {
          parser: { syntax: 'ecmascript', jsx: true }
        }
      });
      console.log('✓ Fixed & Validated:', f);
    } catch (err) {
      console.error('✗ STILL FAILS in', f, ':', err.message);
    }
  }
}

cleanAndValidate();
