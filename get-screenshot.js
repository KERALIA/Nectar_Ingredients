const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true
  });

  const page = await browser.newPage();

  const errors = [];
  page.on('pageerror', (exception) => errors.push(exception.toString()));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  try {
    console.log("Navigating to localhost:3000...");
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'live-view.png', fullPage: true });
    console.log("SUCCESS: Screenshot saved as live-view.png");

    if (errors.length > 0) {
      console.log("ERRORS_FOUND:\n" + errors.join('\n'));
    } else {
      console.log("CLEAN: No console errors detected.");
    }
  } catch (err) {
    console.error("FAIL: Could not load the site:", err.message);
  }

  await browser.close();
})();
