const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 8080,
    proxy: {
      '/ai': {
        target: process.env.VUE_APP_API_BASE_URL || 'http://localhost:8000',
        changeOrigin: true,
        pathRewrite: {
          '^/ai': '/ai'
        }
      }
    }
  }
})
