import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 1080 }
  });

  const page = await browser.newPage();

  console.log('Navigating to localhost:5179...');
  await page.goto('http://localhost:5179', { waitUntil: 'networkidle2' });

  // Wait for page to load
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('Scrolling to Artist Scene...');
  // Scroll to the artist scene - it's likely the 3rd or 4th section
  await page.evaluate(() => {
    // Scroll down multiple viewport heights
    window.scrollTo(0, window.innerHeight * 3);
  });

  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('Taking screenshot of Artist Scene...');
  await page.screenshot({ path: '/tmp/artist-scene.png', fullPage: false });
  console.log('Screenshot saved: /tmp/artist-scene.png');

  // Try to find artist cards with a more generic selector
  console.log('Looking for artist cards...');
  const cards = await page.$$('.relative.w-\\[200px\\].h-\\[200px\\]');
  console.log(`Found ${cards.length} artist cards`);

  if (cards.length > 0) {
    // Click a card on the left side
    console.log('\nClicking card on the LEFT side (card #2)...');
    await cards[2].click();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.screenshot({ path: '/tmp/artist-flip-left.png', fullPage: false });
    console.log('Screenshot saved: /tmp/artist-flip-left.png');

    // Close
    await page.keyboard.press('Escape');
    await new Promise(resolve => setTimeout(resolve, 500));

    // Click a card on the right side
    console.log('\nClicking card on the RIGHT side (card #' + (cards.length - 3) + ')...');
    await cards[cards.length - 3].click();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.screenshot({ path: '/tmp/artist-flip-right.png', fullPage: false });
    console.log('Screenshot saved: /tmp/artist-flip-right.png');
  } else {
    console.log('No artist cards found - taking debug screenshot');
    await page.screenshot({ path: '/tmp/debug.png', fullPage: true });
  }

  console.log('\n✅ Test complete! Check screenshots in /tmp/');
  await browser.close();
})();
