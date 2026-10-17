import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
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
