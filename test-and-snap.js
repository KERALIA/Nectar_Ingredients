const { firefox } = require('playwright');

(async () => {
  // Get URL from command line arguments, default to localhost:3000 if not provided
  const url = process.argv[2] || 'http://localhost:3000';

  // Create a safe filename from the URL
  let filename = 'snap.png';
  try {
    const parsedUrl = new URL(url);
    const pathPart = parsedUrl.pathname === '/' ? 'home' : parsedUrl.pathname.replace(/\//g, '-').replace(/^-|-$/g, '');
    filename = `snap-${pathPart}.png`;
  } catch (e) {
    // Keep default if URL parsing fails
  }

  const browser = await firefox.launch({
    headless: true
  });

  const page = await browser.newPage();

  const errors = [];
  page.on('pageerror', (exception) => errors.push(exception.toString()));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  try {
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: filename, fullPage: true });
    console.log(`SUCCESS: Screenshot saved as ${filename}`);

    if (errors.length > 0) {
      console.log("ERRORS_FOUND:\n" + errors.join('\n'));
    } else {
      console.log("CLEAN: No console errors detected.");
    }
  } catch (err) {
    console.error(`FAIL: Could not load the site ${url}:`, err.message);
  }

  await browser.close();
})();
