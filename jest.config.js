// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  clearMocks: true,
  coverageDirectory: 'coverage',
  rootDir: '__tests__',
  preset: '@shelf/jest-mongodb',
  transform: {
    '^.+\\.(js|ts)$': 'ts-jest'
  },
  watchPathIgnorePatterns: ['globalConfig'],
  testRegex: '...spec.ts$'
}
