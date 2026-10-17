import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    // DOM tests never touch the network: no iframe pages, scripts or styles.
    environmentOptions: {
      happyDOM: {
        settings: {
          disableIframePageLoading: true,
          disableJavaScriptFileLoading: true,
          disableCSSFileLoading: true,
        },
      },
    },
    coverage: {
      provider: 'v8',
      // All logic lives in src/lib; scripts/ and components are thin I/O and
      // markup over it, covered by the build itself and the system tests.
      include: ['src/lib/**/*.ts'],
      reporter: ['text', 'html'],
      // Henry's standing requirement: nothing goes to review below 95% branch coverage.
      thresholds: { branches: 95, functions: 95, lines: 95, statements: 95 },
    },
  },
});
