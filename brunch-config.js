module.exports = {
  files: {
    javascripts: {
      joinTo: {
        'vendor.js': /^(?!app\/)/,
        'app.js': /^app\//
      }
    },
    stylesheets: { joinTo: 'app.css' }
  },
  server: {
    hostname: '0.0.0.0',
    port: 8080,
    noPushState: true,
  },
  plugins: {
    eslint: {
      pattern: /^app\/.*\.js$/
    },
    postcss: {
      processors: [
        require('autoprefixer')(['last 2 versions'])
      ]
    },
    sass: {
      mode: 'native',
      options: { includePaths: ['node_modules/nio-scss/scss'] },
      functions: require('nio-scss')
    }
  }
}
