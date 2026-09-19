// jest.config.js
// Configuración de Jest (el programa que corre los tests).

module.exports = {
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/tests/**/*.test.js'],

  // setupEnv.js corre ANTES de cada archivo de test (para cargar .env.test)
  setupFiles: ['<rootDir>/tests/setup/setupEnv.js'],

  // CAMBIO: antes decía "setupFilesAfterEach" (mal).
  // La opción correcta es "setupFilesAfterEnv" (sin "Each").
  setupFilesAfterEnv: ['<rootDir>/tests/setup/setupAfterEnv.js'],

  globalSetup: '<rootDir>/tests/setup/globalSetup.js',
  globalTeardown: '<rootDir>/tests/setup/globalTeardown.js',

  testTimeout: 30000,
  verbose: true,
  forceExit: true,

  collectCoverageFrom: [
    'app/**/*.js',
    '!app/config/swagger.js',
    '!app/models/index.js',
    '!app/app.js',
    '!app/server.js',
  ],
  coveragePathIgnorePatterns: ['/node_modules/', '/tests/'],
};