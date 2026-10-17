import { defineConfig, devices, type Project } from '@playwright/test';

// System tests run against the production build (`npm run build`) served by
// `astro preview`, on the phones, tablets and desktops in docs/decisions.md.
// iPhones and iPads run in WebKit (Safari's engine), Android in Chromium.

const PORT = 4322;
const base = `/${(process.env['BASE_PATH'] ?? '').replace(/^\/|\/$/g, '')}/`.replace('//', '/');

type Engine = 'chromium' | 'firefox' | 'webkit';
const targets: { name: string; engine: Engine; use: Project['use'] }[] = [
  // Phones: current iPhones (large, standard, landscape) and Android (small and large).
  { name: 'iPhone 17 Pro Max', engine: 'webkit', use: devices['iPhone 17 Pro Max'] },
  { name: 'iPhone 17', engine: 'webkit', use: devices['iPhone 17'] },
  { name: 'iPhone 17 Pro landscape', engine: 'webkit', use: devices['iPhone 17 Pro landscape'] },
  { name: 'Galaxy S24', engine: 'chromium', use: devices['Galaxy S24'] },
  { name: 'Pixel 9 Pro XL', engine: 'chromium', use: devices['Pixel 9 Pro XL'] },
  // Tablet.
  { name: 'iPad Pro 11', engine: 'webkit', use: devices['iPad Pro 11'] },
  // Desktop: the three engines, a wide screen and a 320px narrow window (zoomed or split view).
  { name: 'Desktop Chrome', engine: 'chromium', use: devices['Desktop Chrome'] },
  { name: 'Desktop Firefox', engine: 'firefox', use: devices['Desktop Firefox'] },
  { name: 'Desktop Safari', engine: 'webkit', use: devices['Desktop Safari'] },
  {
    name: 'Desktop wide 1920',
    engine: 'chromium',
    use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
  },
  {
    name: 'Narrow 320',
    engine: 'chromium',
    use: { ...devices['Desktop Chrome'], viewport: { width: 320, height: 640 } },
  },
];

// E2E_ENGINES=chromium runs every profile in Chromium, for machines without
// WebKit or Firefox installed. CI installs all three and never sets it.
const available = process.env['E2E_ENGINES']?.split(',') as Engine[] | undefined;
const chromiumPath = process.env['PW_CHROMIUM_PATH'];

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env['CI']),
  retries: 0,
  reporter: process.env['CI'] ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}${base}`,
    trace: 'retain-on-failure',
  },
  projects: targets.map(({ name, engine, use }) => {
    const runAs = !available || available.includes(engine) ? engine : 'chromium';
    return {
      name: runAs === engine ? name : `${name} (in ${runAs})`,
      use: {
        ...use,
        browserName: runAs,
        ...(runAs === 'chromium' && chromiumPath
          ? { launchOptions: { executablePath: chromiumPath } }
          : {}),
      },
    };
  }),
  webServer: {
    command: `npx astro preview --port ${PORT} --ignore-lock`,
    url: `http://localhost:${PORT}${base}`,
    reuseExistingServer: !process.env['CI'],
  },
});
