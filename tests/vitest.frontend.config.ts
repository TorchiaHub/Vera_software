import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    name: 'Frontend Tests',
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['frontend/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage/frontend',
      include: ['../frontend/src/**/*.{ts,tsx,js,jsx}'],
      exclude: [
        '../frontend/src/**/*.d.ts',
        '../frontend/src/**/*.config.{ts,js}',
        '../frontend/src/types/**/*',
        '../frontend/src/**/*.stories.{ts,tsx}',
        '../frontend/src/**/*.test.{ts,tsx}'
      ],
      thresholds: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70
      }
    },
    globals: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../frontend/src'),
      '@components': path.resolve(__dirname, '../frontend/src/components'),
      '@pages': path.resolve(__dirname, '../frontend/src/pages'),
      '@hooks': path.resolve(__dirname, '../frontend/src/hooks'),
      '@services': path.resolve(__dirname, '../frontend/src/services'),
      '@utils': path.resolve(__dirname, '../frontend/src/utils'),
      '@contexts': path.resolve(__dirname, '../frontend/src/contexts')
    }
  }
});