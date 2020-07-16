module.exports = {
  presets: [
    [
      '@babel/preset-env',
      { exclude: ['transform-regenerator'] }
    ]
  ],
  plugins: [
    [ '@babel/plugin-proposal-decorators', { legacy: true } ],
    [ '@babel/plugin-proposal-class-properties', { loose: true } ]
  ]
};
