module.exports = {
  presets: [
    ['@vue/cli-plugin-babel/preset', { useBuiltIns: 'usage' }]
  ],
  plugins: [
    [ '@babel/plugin-proposal-decorators', { legacy: true } ],
    [ '@babel/plugin-proposal-class-properties', { loose: true } ],
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-logical-assignment-operators'
  ]
};
