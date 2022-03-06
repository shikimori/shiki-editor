// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    '**/*.{js,vue}',
    '!**/node_modules/**',
    '!webpack.config.test.js'
  ],
  transformIgnorePatterns: [
    '/node_modules/(?!p-defer|shiki-decorators/)'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    'webpack.config.test.js'
  ]
};
