import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  test: {
    root: fileURLToPath(new URL('.', import.meta.url)),
    environment: 'node',
    globals: true,
    include: ['tests/**/*.test.js'],
    setupFiles: ['./tests/setup/setupEnv.js', './tests/setup/setupAfterEnv.js'],
    sequence: { setupFiles: 'list' },
    globalSetup: ['./tests/setup/globalSetup.js'],
    // Todos los archivos comparten una BD: no ejecutar resets simultáneos.
    fileParallelism: false,
    maxWorkers: 1,
    pool: 'forks',
    isolate: true,
    testTimeout: 30000,
    hookTimeout: 30000,
    coverage: {
      provider: 'v8',
      include: ['app/**/*.js'],
      exclude: ['app/config/swagger.js', 'app/app.js', 'app/server.js'],
      reporter: ['text', 'html', 'lcov'],
    },
  },
});
