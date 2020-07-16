// https://cli.vuejs.org/config/#css-modules
module.exports = {
  lintOnSave: process.env.NODE_ENV === 'development',
  devServer: {
    // overlay: {
    //   warnings: true,
    //   errors: true
    // }
  },
  transpileDependencies: ['shiki-utils'],
  pluginOptions: {
  }
};
