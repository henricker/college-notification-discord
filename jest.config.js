/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: [
    './src/**',
    '!./src/index.ts',
    '!./src/infra/config/**'
  ],
  testMatch: ['**/__tests__/**/*.ts?(x)']
};
