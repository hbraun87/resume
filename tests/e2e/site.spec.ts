import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { builtPages, runsEveryPage, samplePages } from './pages';

const pages = builtPages();
const sample = samplePages(pages);

/** Every page on the core profiles; one page per template everywhere else. */
function coverPage(path: string, projectName: string) {
  test.skip(
    !sample.has(path) && !runsEveryPage(projectName),
    'other profiles run one page per template',
  );
}
const DARK_INK = 'rgb(13, 17, 24)';
const LIGHT_INK = 'rgb(244, 241, 234)';

/** Fails the test on console errors, uncaught exceptions and any request off this origin. */
async function watch(page: Page) {
  const problems: string[] = [];
  // Name what a Content Security Policy violation blocked; browsers' own messages often don't.
  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (event) => {
      console.error(
        `CSP blocked ${event.effectiveDirective}: ${event.blockedURI} ${event.sample}`.trim(),
      );
    });
  });
  page.on('console', (message) => {
    if (message.type() === 'error') problems.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => problems.push(`exception: ${error.message}`));
  page.on('request', (request) => {
    const { protocol, hostname } = new URL(request.url());
    if (protocol.startsWith('http') && hostname !== 'localhost') {
      problems.push(`third-party request on load: ${request.url()}`);
    }
  });
  page.on('requestfailed', (request) => problems.push(`failed: ${request.url()}`));
  return problems;
}

for (const path of pages) {
  for (const scheme of ['dark', 'light'] as const) {
    test.describe(`/${path} in ${scheme} mode`, () => {
      test.use({ colorScheme: scheme });

      test('loads cleanly, fits the screen and passes axe', async ({ page }, testInfo) => {
        coverPage(path, testInfo.project.name);
        const problems = await watch(page);
        await page.goto(path, { waitUntil: 'networkidle' });

        const fit = await page.evaluate(() => {
          const width = window.innerWidth;
          const sticksOut = (el: Element) => el.getBoundingClientRect().right > width + 1;
          // Name the innermost elements past the right edge, so a failure says what to fix.
          const culprits = [...document.querySelectorAll('body *')]
            .filter((el) => sticksOut(el) && ![...el.children].some(sticksOut))
            .slice(0, 5)
            .map((el) => {
              const { left, right } = el.getBoundingClientRect();
              return `${el.tagName.toLowerCase()}.${[...el.classList].join('.')} ${Math.round(left)}→${Math.round(right)}`;
            });
          return { scrollWidth: document.documentElement.scrollWidth, width, culprits };
        });
        expect(
          fit.scrollWidth,
          `no horizontal scrolling: ${fit.culprits.join(', ')}`,
        ).toBeLessThanOrEqual(fit.width);

        const axe = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .analyze();
        expect(axe.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);

        expect(problems).toEqual([]);

        // caret: 'initial' stops Playwright injecting a <style>, which WebKit
        // rightly blocks under the site's Content Security Policy.
        await testInfo.attach(`${scheme}.png`, {
          body: await page.screenshot({ fullPage: true, caret: 'initial' }),
          contentType: 'image/png',
        });
      });
    });
  }

  test(`/${path}: links, images and touch targets are sound`, async ({ page }, testInfo) => {
    coverPage(path, testInfo.project.name);
    await page.goto(path);

    const brokenAnchors = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLAnchorElement>('a[href*="#"]')]
        .filter((a) => a.pathname === location.pathname && a.hash.length > 1)
        .filter((a) => !document.getElementById(decodeURIComponent(a.hash.slice(1))))
        .map((a) => a.getAttribute('href')),
    );
    expect(brokenAnchors, 'in-page links point at real sections').toEqual([]);

    const images = await page.evaluate(() =>
      [...document.images].map((img) => ({
        src: img.currentSrc || img.src,
        alt: img.hasAttribute('alt'),
        sized: img.hasAttribute('width') && img.hasAttribute('height'),
      })),
    );
    for (const image of images) {
      expect(image.alt, `${image.src} has alt`).toBe(true);
      expect(image.sized, `${image.src} reserves its size`).toBe(true);
    }

    // WCAG 2.2 target size (2.5.8): 24×24 CSS px for controls outside running text.
    // On touch screens the header controls meet Apple's and Google's 44px guideline.
    const tooSmall = await page.evaluate(
      ({ touch }) =>
        [...document.querySelectorAll<HTMLElement>('a[href], button, [role="button"], summary')]
          .filter((el) => el.checkVisibility() && !el.closest('p, li:not(nav li)'))
          .map((el) => {
            const box = el.getBoundingClientRect();
            const min = touch && el.closest('header') && el.tagName === 'BUTTON' ? 44 : 24;
            return { el: el.outerHTML.slice(0, 80), w: box.width, h: box.height, min };
          })
          .filter((t) => t.w > 0 && (t.w < t.min || t.h < t.min)),
      { touch: Boolean(testInfo.project.use.hasTouch) },
    );
    expect(tooSmall, 'touch targets are large enough').toEqual([]);
  });
}

test.describe('theme', () => {
  test('follows the system preference by default', async ({ page }) => {
    for (const [scheme, ink] of [
      ['dark', DARK_INK],
      ['light', LIGHT_INK],
    ] as const) {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto('');
      await expect(page.locator('body')).toHaveCSS('background-color', ink);
    }
  });

  test('the toggle overrides the system, sets the browser bar and is remembered', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('');
    const toggle = page.getByRole('button', { name: 'Light theme' });
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('body')).toHaveCSS('background-color', LIGHT_INK);
    const bars = page.locator('meta[name="theme-color"]');
    for (const bar of await bars.all()) await expect(bar).toHaveAttribute('content', '#f4f1ea');

    await page.reload();
    await expect(page.locator('body')).toHaveCSS('background-color', LIGHT_INK);
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    for (const bar of await bars.all()) await expect(bar).toHaveAttribute('content', '#f4f1ea');

    await toggle.click();
    await expect(page.locator('body')).toHaveCSS('background-color', DARK_INK);
  });
});

test('keyboard: the skip link comes first and moves focus to the content', async ({
  page,
  browserName,
}, testInfo) => {
  test.skip(Boolean(testInfo.project.use.hasTouch), 'touch devices have no Tab key');
  await page.goto('');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await page.keyboard.press('Tab');
  if (browserName === 'webkit' && !(await skip.evaluate((el) => el === document.activeElement))) {
    // macOS Safari only tabs to links with Option held.
    await page.keyboard.press('Alt+Tab');
  }
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the page still reads and the theme follows the system', async ({ page }) => {
    await page.goto('');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('.theme-toggle')).toBeHidden();
  });
});

test('reduced motion: nothing keeps animating', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('', { waitUntil: 'networkidle' });
  const running = await page.evaluate(() =>
    document
      .getAnimations()
      .filter((a) => a.playState === 'running')
      .map((a) => (a as CSSAnimation).animationName ?? 'script animation'),
  );
  expect(running).toEqual([]);
});

test('mobile setup: safe areas, text zoom and a header that leaves room', async ({ page }) => {
  await page.goto('');
  await expect(page.locator('meta[name="viewport"]')).toHaveAttribute(
    'content',
    /viewport-fit=cover/,
  );
  // "none" would stop iPhone users from enlarging text. Browsers report a
  // computed 100% either way, so read the stylesheets themselves.
  const css = await page.evaluate(async () => {
    const inline = [...document.querySelectorAll('style')].map((style) => style.textContent);
    const linked = await Promise.all(
      [...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')].map((link) =>
        fetch(link.href).then((response) => response.text()),
      ),
    );
    return [...inline, ...linked].join('\n');
  });
  expect(css).not.toMatch(/text-size-adjust\s*:\s*none/);

  const header = await page.locator('header').boundingBox();
  const height = page.viewportSize()?.height ?? 0;
  expect(header?.height ?? 0, 'sticky header takes at most a fifth of the screen').toBeLessThan(
    height / 5,
  );
});
