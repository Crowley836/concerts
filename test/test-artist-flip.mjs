import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: false, // Show the browser so we can see what's happening
    defaultViewport: { width: 1920, height: 1080 }
  });

  const page = await browser.newPage();

  console.log('Navigating to localhost:5179...');
  await page.goto('http://localhost:5179', { waitUntil: 'networkidle2' });

  console.log('Scrolling to Artist Scene...');
  // Wait for page to load
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Scroll down to find the artist scene
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight / 2);
  });
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('Waiting for artist scene to load...');
  await page.waitForSelector('[data-artist-id]', { timeout: 10000 });

  console.log('Artist cards loaded! Taking initial screenshot...');
  await page.screenshot({ path: '/tmp/artist-scene-initial.png', fullPage: true });

  // Get all artist cards
  const cards = await page.$$('[data-artist-id]');
  console.log(`Found ${cards.length} artist cards`);

  if (cards.length > 0) {
    // Click a card on the left side
    console.log('\nClicking card on the LEFT side...');
    const leftCard = cards[2]; // 3rd card should be on left
    await leftCard.click();
    await new Promise(resolve => setTimeout(resolve, 800)); // Wait for animation
    await page.screenshot({ path: '/tmp/artist-flip-left.png', fullPage: true });
    console.log('Screenshot saved: /tmp/artist-flip-left.png');

    // Close the card (ESC)
    await page.keyboard.press('Escape');
    await new Promise(resolve => setTimeout(resolve, 500));

    // Click a card on the right side
    console.log('\nClicking card on the RIGHT side...');
    const rightCard = cards[cards.length - 3]; // 3rd from end should be on right
    await rightCard.click();
    await new Promise(resolve => setTimeout(resolve, 800));
    await page.screenshot({ path: '/tmp/artist-flip-right.png', fullPage: true });
    console.log('Screenshot saved: /tmp/artist-flip-right.png');

    // Close
    await page.keyboard.press('Escape');
    await new Promise(resolve => setTimeout(resolve, 500));

    // Click a card in the middle
    console.log('\nClicking card in the MIDDLE...');
    const middleCard = cards[Math.floor(cards.length / 2)];
    await middleCard.click();
    await new Promise(resolve => setTimeout(resolve, 800));
    await page.screenshot({ path: '/tmp/artist-flip-middle.png', fullPage: true });
    console.log('Screenshot saved: /tmp/artist-flip-middle.png');
  }

  console.log('\n✅ Test complete! Check screenshots in /tmp/');
  console.log('Press Ctrl+C to close the browser...');

  // Keep browser open for manual inspection
  await new Promise(() => {});
})();
