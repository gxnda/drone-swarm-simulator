import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts', 'packages/**/*.test.ts'],
    projects: [
      {
        extends: true,
        test: {
          name: 'node',
          environment: 'node',
          include: ['tests/simulation/**/*.test.ts', 'packages/simulation/**/*.test.ts', 'packages/shared/**/*.test.ts']
        }
      },
      {
        extends: true,
        test: {
          name: 'browser',
          environment: 'jsdom',
          include: ['tests/e2e/**/*.spec.ts']
        }
      }
    ]
  }
})