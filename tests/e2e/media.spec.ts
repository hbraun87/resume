import { expect, test } from '@playwright/test';
import { must } from '../must';

const PAGE = 'styleguide/';

test.describe('YouTube facade', () => {
  test('makes no request to YouTube until the visitor plays it', async ({ page }) => {
    const youtube: string[] = [];
    page.on('request', (request) => {
      if (/youtube|ytimg|googlevideo/.test(request.url())) youtube.push(request.url());
    });
    // The player itself is not under test; keep CI off the network.
    await page.route(/youtube-nocookie\.com/, (route) =>
      route.fulfill({ contentType: 'text/html', body: '<title>player</title>' }),
    );
    await page.goto(PAGE, { waitUntil: 'networkidle' });
    // Scroll the whole page (mobile WebKit has no mouse wheel) so lazy media would load.
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForLoadState('networkidle');
    expect(youtube).toEqual([]);

    const play = page.getByRole('button', { name: 'Play video: Until You Fall trailer' });
    await play.scrollIntoViewIfNeeded();
    await play.click();
    const player = page.locator('iframe[title="Until You Fall trailer"]');
    await expect(player).toHaveAttribute(
      'src',
      /^https:\/\/www\.youtube-nocookie\.com\/embed\/S1zZHy7_BFg\?autoplay=1/,
    );
    await expect(player).toBeFocused();
    expect(youtube).toHaveLength(1);
  });

  test('the poster reserves its 16:9 box and the play button fills it', async ({ page }) => {
    await page.goto(PAGE);
    for (const facade of await page.locator('.yt').all()) {
      const box = must(await facade.boundingBox(), 'bounding box');
      expect(box.width / box.height).toBeCloseTo(16 / 9, 1);
      // After the script upgrades the link, the button must still cover the whole poster.
      const target = must(await facade.getByRole('button').boundingBox(), 'bounding box');
      expect(target.width).toBeGreaterThan(box.width - 4);
      expect(target.height).toBeGreaterThan(box.height - 4);
      if ((await facade.locator('img').count()) > 0) {
        const poster = must(await facade.locator('img').boundingBox(), 'poster box');
        expect(poster.width).toBeGreaterThan(box.width - 4);
        expect(poster.height).toBeGreaterThan(box.height - 4);
      }
      const play = must(await facade.locator('.yt-play').boundingBox(), 'bounding box');
      expect(Math.abs(play.x + play.width / 2 - (box.x + box.width / 2))).toBeLessThan(2);
      expect(Math.abs(play.y + play.height / 2 - (box.y + box.height / 2))).toBeLessThan(2);
    }
  });

  test('every component on the styleguide renders something', async ({ page }) => {
    await page.goto(PAGE);
    for (const section of await page.locator('main section').all()) {
      await expect(section.locator('img, .yt').first()).toBeVisible();
    }
  });

  test('plays from the keyboard', async ({ page }, testInfo) => {
    test.skip(Boolean(testInfo.project.use.hasTouch), 'touch devices have no keyboard');
    await page.route(/youtube-nocookie\.com/, (route) => route.fulfill({ body: '' }));
    await page.goto(PAGE);
    const play = page.getByRole('button', { name: /^Play video: Until You Fall/ });
    await play.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('iframe').first()).toBeVisible();
  });
});

test.describe('YouTube facade without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('is a link to the video on YouTube', async ({ page }) => {
    await page.goto(PAGE);
    await expect(
      page.getByRole('link', { name: 'Watch Until You Fall trailer on YouTube' }),
    ).toHaveAttribute('href', 'https://www.youtube.com/watch?v=S1zZHy7_BFg');
  });
});

test.describe('gallery lightbox', () => {
  test('opens, moves, fits the screen and closes back to the thumbnail', async ({
    page,
  }, testInfo) => {
    const touch = Boolean(testInfo.project.use.hasTouch);
    await page.goto(PAGE);
    const gallery = page.getByRole('list', { name: 'Until You Fall screenshots' });
    const thumbs = gallery.getByRole('link');
    const second = thumbs.nth(1);
    await second.scrollIntoViewIfNeeded();
    if (touch) await second.tap();
    else await second.click();

    const dialog = page.getByRole('dialog', { name: 'Until You Fall screenshots' });
    await expect(dialog).toBeVisible();
    const image = dialog.locator('img');
    const secondAlt = await second.locator('img').getAttribute('alt');
    await expect(image).toHaveAttribute('alt', secondAlt ?? '');
    await expect(dialog.getByText(/^2 \/ \d+$/)).toBeVisible();

    // The image loads and fits inside the viewport on every screen.
    await expect
      .poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBeGreaterThan(0);
    const viewport = must(page.viewportSize(), 'viewport');
    const box = must(await image.boundingBox(), 'bounding box');
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 1);

    const next = dialog.getByRole('button', { name: 'Next image' });
    await expect(next).toBeInViewport();
    if (touch) await next.tap();
    else await page.keyboard.press('ArrowRight');
    await expect(dialog.getByText(/^3 \/ \d+$/)).toBeVisible();

    if (touch) {
      // Swipe right to go back.
      await dialog.dispatchEvent('pointerdown', { clientX: 60, clientY: 300 });
      await dialog.dispatchEvent('pointerup', { clientX: 260, clientY: 300 });
      await expect(dialog.getByText(/^2 \/ \d+$/)).toBeVisible();
      await dialog.getByRole('button', { name: 'Close' }).tap();
    } else {
      await page.keyboard.press('Escape');
      await expect(second).toBeFocused();
    }
    await expect(dialog).toBeHidden();
  });
});

test.describe('gallery without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('thumbnails link to the full image', async ({ page, request }) => {
    await page.goto(PAGE);
    const href = await page
      .getByRole('list', { name: 'Until You Fall screenshots' })
      .getByRole('link')
      .first()
      .getAttribute('href');
    expect(href).toMatch(/\.webp$/);
    const response = await request.get(new URL(must(href, 'href'), page.url()).toString());
    expect(response.headers()['content-type']).toBe('image/webp');
  });
});
