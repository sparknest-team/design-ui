const path = require('path')
const webpack = require('webpack')
const uiRoot = path.dirname(require.resolve('@maple-design/ui-vue/package.json'))
const iconsRoot = path.dirname(require.resolve('@maple-design/icons-vue/style.css'))

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: { path: path.resolve(__dirname, 'dist'), filename: 'bundle.js' },
  resolve: {
    extensions: ['.mjs', '.js', '.json'],
    alias: {
      'vue$': require.resolve('vue/dist/vue.runtime.esm-bundler.js'),
      '@maple-design/ui-vue/style$': require.resolve('@maple-design/ui-vue/style'),
      '@maple-design/ui-vue/reset.css$': require.resolve('@maple-design/ui-vue/reset.css'),
      '@maple-design/ui-vue': path.join(uiRoot, 'es'),
      '@maple-design/icons-vue/style.css$': require.resolve('@maple-design/icons-vue/style.css'),
      '@maple-design/icons-vue': path.join(iconsRoot, 'es'),
    },
  },
  module: {
    rules: [
      {
        test: /\.[cm]?js$/,
        type: 'javascript/auto',
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: false,
            configFile: false,
            presets: [['@babel/preset-env', { targets: { chrome: '70' }, modules: false }]],
          },
        },
      },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      __VUE_OPTIONS_API__: JSON.stringify(true),
      __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
    }),
  ],
}
