import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 1080 }
  });

  const page = await browser.newPage();

  console.log('Navigating to localhost:5179...');
  await page.goto('http://localhost:5179', { waitUntil: 'networkidle2' });
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Scroll to Artist Scene
  await page.evaluate(() => {
    window.scrollTo(0, window.innerHeight * 3);
  });
  await new Promise(resolve => setTimeout(resolve, 2000));

  const cards = await page.$$('.relative.w-\\[200px\\].h-\\[200px\\]');
  console.log(`Found ${cards.length} cards`);

  // Test top-left card
  console.log('\n1. Testing TOP-LEFT card (index 10)...');
  await cards[10].click();
  await new Promise(resolve => setTimeout(resolve, 1000));
  await page.screenshot({ path: '/tmp/flip-top-left.png', fullPage: false });
  await page.keyboard.press('Escape');
  await new Promise(resolve => setTimeout(resolve, 500));

  // Test top-right card
  console.log('2. Testing TOP-RIGHT card (index ' + (cards.length - 50) + ')...');
  await cards[cards.length - 50].click();
  await new Promise(resolve => setTimeout(resolve, 1000));
  await page.screenshot({ path: '/tmp/flip-top-right.png', fullPage: false });
  await page.keyboard.press('Escape');
  await new Promise(resolve => setTimeout(resolve, 500));

  // Scroll down more to test bottom cards
  await page.evaluate(() => {
    window.scrollBy(0, window.innerHeight * 0.5);
  });
  await new Promise(resolve => setTimeout(resolve, 1000));

  const cardsAfterScroll = await page.$$('.relative.w-\\[200px\\].h-\\[200px\\]');

  // Test middle-left card
  console.log('3. Testing MIDDLE-LEFT card...');
  await cardsAfterScroll[5].click();
  await new Promise(resolve => setTimeout(resolve, 1000));
  await page.screenshot({ path: '/tmp/flip-middle-left.png', fullPage: false });
  await page.keyboard.press('Escape');
  await new Promise(resolve => setTimeout(resolve, 500));

  // Test middle-right card
  console.log('4. Testing MIDDLE-RIGHT card...');
  await cardsAfterScroll[cardsAfterScroll.length - 10].click();
  await new Promise(resolve => setTimeout(resolve, 1000));
  await page.screenshot({ path: '/tmp/flip-middle-right.png', fullPage: false });

  console.log('\n✅ Screenshots saved in /tmp/flip-*.png');
  await browser.close();
})();
