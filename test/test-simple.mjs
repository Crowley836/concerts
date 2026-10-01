import puppeteer from 'puppeteer';

const PORT = process.env.PORT || 5173;
const BASE_URL = `http://localhost:${PORT}`;

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1920, height: 1080 }
  });

  const page = await browser.newPage();

  console.log(`Navigating to ${BASE_URL}...`);
  await page.goto(BASE_URL, { waitUntil: 'networkidle2' });

  console.log('Page loaded, taking screenshot...');
  await page.screenshot({ path: 'test/screenshots/page-initial.png', fullPage: true });
  console.log('Screenshot saved: test/screenshots/page-initial.png');

  // Wait a bit and scroll to see if artist scene loads
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('Scrolling down...');
  await page.evaluate(() => {
    window.scrollBy(0, window.innerHeight * 2);
  });

  await new Promise(resolve => setTimeout(resolve, 2000));

  await page.screenshot({ path: 'test/screenshots/page-scrolled.png', fullPage: true });
  console.log('Screenshot saved: test/screenshots/page-scrolled.png');

  console.log('\n✅ Check test/screenshots/page-*.png files');
  await browser.close();
})();
