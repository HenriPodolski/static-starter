const path = require('path');
const glob = require('glob');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const supportedLocales = ['en', 'de'];
const dataSourceFolder = '../src/data';
const htmlWebpackPluginsArray = supportedLocales.map((locale) => {
  const articles = glob.sync('src/data/' + locale + '/articles/*.json');
  const pages = [
    new HtmlWebpackPlugin({
      template: '!!ejs-compiled-loader!' + path.resolve(__dirname, '../src/index.html'),
      data: {
        page: 'home',
        locale,
        supportedLocales,
        relativeRootPath: '../',
        global: require(dataSourceFolder + '/' + locale + '/global.json'),
        config: require(dataSourceFolder + '/config.json'),
        content: require(dataSourceFolder + '/' + locale + '/home.json')
      },
      filename: locale + '/index.html'
    }),
    ...articles.map((content) => {
      const replaceExpression = new RegExp('src\/data\/' + locale + '\/articles\/(.+)\.json');
      const outputFilePath = replaceExpression.exec(content)[1];
      return new HtmlWebpackPlugin({
        template: '!!ejs-compiled-loader!' + path.resolve(__dirname, '../src/index.html'),
        data: {
          page: 'article',
          locale,
          supportedLocales,
          relativeRootPath: '../',
          global: require(dataSourceFolder + '/' + locale + '/global.json'),
          config: require(dataSourceFolder + '/config.json'),
          content: require('../' + content)
        },
        filename: locale + '/' + outputFilePath + '.html'
      });
    })
  ];
  return pages;
});
// add default lang index.html
htmlWebpackPluginsArray.unshift(
  new HtmlWebpackPlugin({
    template: '!!ejs-compiled-loader!' + path.resolve(__dirname, '../src/index.html'),
    data: {
      page: 'home',
      locale: 'en',
      supportedLocales,
      relativeRootPath: '',
      global: require(dataSourceFolder + '/en/global.json'),
      config: require(dataSourceFolder + '/config.json'),
      content: require(dataSourceFolder + '/en/home.json')
    },
    filename: 'index.html'
  })
);
// Array.flat()
const htmlWebpackPlugins = [].concat.apply([], htmlWebpackPluginsArray);

module.exports = {
  entry: {
    app: path.resolve(__dirname, '../src/js/index.js')
  },
  output: {
    path: path.join(__dirname, '../build'),
    filename: 'js/[name].js'
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      name: false
    }
  },
  plugins: [
    new CleanWebpackPlugin(['build'], { root: path.resolve(__dirname, '..') }),
    new CopyWebpackPlugin([
      { from: path.resolve(__dirname, '../public'), to: 'public' }
    ]),
    ...htmlWebpackPlugins
  ],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, '../src')
    }
  },
  module: {
    rules: [
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto'
      },
      {
        test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[path][name].[ext]'
          }
        }
      },
    ]
  }
};
