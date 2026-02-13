const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: process.env.CI ? '/virtuoso-d365-crm/' : '/',
  outputDir: 'dist',
  assetsDir: 'assets',
  productionSourceMap: false,

  devServer: {
    port: 3000,
    open: true,
  },

  chainWebpack: config => {
    config.plugin('html').tap(args => {
      args[0].title = 'Virtuoso D365 Sales CRM'
      return args
    })
  },

  css: {
    loaderOptions: {
      postcss: {
        postcssOptions: {
          plugins: [
            require('tailwindcss'),
            require('autoprefixer'),
          ],
        },
      },
    },
  },
})
