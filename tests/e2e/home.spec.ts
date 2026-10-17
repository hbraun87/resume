import { expect, test, type Page } from '@playwright/test';

// The loading-screen home page (docs/brief/10-loading-screen-spec.md), on every
// phone, tablet and desktop profile.

const hud = (page: Page) => page.locator('[data-hud]');
const percent = (page: Page) => page.locator('[data-hud-pct]');

async function scrollToBottom(page: Page) {
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
}

test.describe('loading HUD', () => {
  test('fills with the scroll and completes at the bottom', async ({ page }) => {
    await page.goto('');
    await expect(hud(page)).toBeVisible();
    await expect(percent(page)).toHaveText('0');
    await expect(page.locator('[data-hud-stage]')).toHaveText('Booting player profile');

    await page.locator('#games').scrollIntoViewIfNeeded();
    await page.evaluate(() => {
      const games = document.getElementById('games');
      if (games) window.scrollTo(0, games.offsetTop);
    });
    await expect(page.locator('[data-hud-stage]')).toHaveText(/^Streaming levels \(\d+\/21\)$/);
    // The nav is hidden on phones, but still marks the section in view.
    await expect(page.locator('[data-nav] a[href$="#games"]')).toHaveAttribute(
      'aria-current',
      'true',
    );

    await scrollToBottom(page);
    await expect(percent(page)).toHaveText('100');
    await expect(hud(page)).toHaveClass(/is-done/);
    await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    await expect(page.locator('[data-finale-state]')).toHaveText('Load complete');
    await expect(page.getByRole('status').filter({ hasText: 'Completionist' })).toBeVisible();

    // The load stays complete when the visitor scrolls back up.
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(percent(page)).toHaveText('100');
  });

  test('nothing hides behind the HUD at the bottom of the page', async ({ page }) => {
    await page.goto('');
    await scrollToBottom(page);
    await expect(hud(page)).toHaveClass(/is-done/);
    const overlap = await page.evaluate(() => {
      const bar = document.querySelector('[data-hud]')?.getBoundingClientRect();
      const text = document.querySelector('.site-footer p:last-child')?.getBoundingClientRect();
      return bar && text ? text.bottom - bar.top : Infinity;
    });
    expect(overlap, 'the last footer line clears the HUD').toBeLessThanOrEqual(0);
  });
});

test.describe('finale', () => {
  test('draws the headline on the canvas and keeps it for screen readers', async ({ page }) => {
    await page.goto('');
    const frame = page.locator('[data-finale]');
    await expect(frame).toHaveClass(/is-live/);
    await expect(page.getByRole('heading', { name: "Let's build the next one." })).toBeAttached();
    await scrollToBottom(page);
    await frame.scrollIntoViewIfNeeded();
    // Wait out the burst, then check the canvas holds particles.
    await page.waitForTimeout(1200);
    const painted = await page
      .locator('[data-finale] canvas')
      .evaluate((canvas: HTMLCanvasElement) => {
        const context = canvas.getContext('2d');
        if (!context) return 0;
        const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
        let count = 0;
        for (let i = 3; i < data.length; i += 4 * 16) if ((data[i] ?? 0) > 0) count += 1;
        return count;
      });
    expect(painted).toBeGreaterThan(50);
  });

  test('PRESS START copies the email or selects it', async ({ page, browserName, context }) => {
    if (browserName === 'chromium')
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('');
    const start = page.getByRole('button', { name: 'Press start' });
    await start.scrollIntoViewIfNeeded();
    await start.click();
    const toast = page.locator('[data-toasts] .toast');
    await expect(toast).toContainText('Player 2 has joined');
    await expect(toast).toContainText(/Email (copied to clipboard|selected)/);
    await expect(hud(page)).toHaveClass(/is-done/);
    if (browserName === 'chromium') {
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('hbraun87@gmail.com');
    }
  });

  test('the Konami code turns on party mode', async ({ page }, testInfo) => {
    test.skip(Boolean(testInfo.project.use.hasTouch), 'touch devices have no arrow keys');
    await page.goto('');
    for (const key of [
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'b',
      'a',
    ]) {
      await page.keyboard.press(key);
    }
    await expect(page.locator('[data-toasts]')).toContainText('Party mode on');
    await expect(hud(page)).toHaveClass(/is-done/);
  });
});

test('platform filters show one platform and announce the count', async ({ page }) => {
  await page.goto('');
  const cards = page.locator('[data-platform]');
  await expect(cards).toHaveCount(21);
  const vr = page.getByRole('button', { name: /^VR \d+$/ });
  await vr.scrollIntoViewIfNeeded();
  await vr.click();
  await expect(vr).toHaveAttribute('aria-pressed', 'true');
  const shown = await cards.filter({ visible: true }).count();
  expect(shown).toBeGreaterThan(0);
  expect(shown).toBeLessThan(21);
  await expect(page.locator('[data-filter-status]')).toHaveText(`Showing ${shown} VR titles`);
  await page.getByRole('button', { name: /^All \d+$/ }).click();
  await expect(cards.filter({ visible: true })).toHaveCount(21);
});

test('every card and research row links to its own page', async ({ page, request }) => {
  await page.goto('');
  const links = await page
    .locator('[data-platform] h3 a, [data-asset="shader"] h3 a')
    .evaluateAll((anchors) => anchors.map((a) => (a as HTMLAnchorElement).href));
  expect(links.length).toBeGreaterThan(30);
  for (const link of links.slice(0, 3)) expect((await request.get(link)).ok()).toBe(true);
});

test.describe('home without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('reads as a plain page: no HUD, text headline, email link', async ({ page }) => {
    await page.goto('');
    await expect(hud(page)).toBeHidden();
    await expect(page.locator('[data-filters]')).toBeHidden();
    await expect(page.locator('[data-platform]').filter({ visible: true })).toHaveCount(21);
    await expect(page.getByRole('heading', { name: "Let's build the next one." })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Press start' })).toHaveAttribute(
      'href',
      'mailto:hbraun87@gmail.com',
    );
    await expect(page.locator('[data-boot]')).toContainText('mount henry_braun.pak');
  });
});

test.describe('home with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('prints the console at once and jumps to 100%', async ({ page }) => {
    await page.goto('');
    await expect(page.locator('.type-rest')).toHaveCount(0);
    await scrollToBottom(page);
    await expect(percent(page)).toHaveText('100');
    await expect(page.locator('[data-flash]')).not.toHaveClass(/is-flashing/);
  });
});
