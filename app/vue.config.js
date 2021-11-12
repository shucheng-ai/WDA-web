let localConfig;

try {
  localConfig = require('./local.config');
} catch (e) {
  localConfig = null;
}

const publicPath = process.env.NODE_ENV === 'production' ? '/static' : '/';

const defaultapi = 'http://127.0.0.1:8000/';
const api = localConfig ? localConfig.api : defaultapi;
console.log(api);

module.exports = {
  publicPath: publicPath,
  // assetsDir: 'static',
  outputDir: '../dist/',
  productionSourceMap: false,
  css: {
    loaderOptions: {
      less: {
        lessOptions: {
          modifyVars: {
            'primary-color': '#993030',
            'link-color': '#ca9999',
            'border-radius-base': '15px',
            'border-radius-sm': '8px',
            'table-padding-vertical': '10px',
            'table-padding-horizontal': '16px',
          },
          javascriptEnabled: true,
        },
      },
    },
  },
  devServer: {
    compress: true,
    disableHostCheck: true,
    proxy: {
      '/api': {
        target: api,
      },
      '/404': {
        target: api,
      },
      '/401': {
        target: api,
      },
    },
  },
};
