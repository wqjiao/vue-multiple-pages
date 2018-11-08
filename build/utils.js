'use strict'
const path = require('path')
const config = require('../config')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')
const packageConfig = require('../package.json')
const entry_prefix = "./src/pages/"

exports.assetsPath = function (_path) {
  const assetsSubDirectory = process.env.NODE_ENV === 'production'
    ? config.build.assetsSubDirectory
    : config.dev.assetsSubDirectory

  return path.posix.join(assetsSubDirectory, _path)
}

exports.cssLoaders = function (options) {
  options = options || {}

  const cssLoader = {
    loader: 'css-loader',
    options: {
      sourceMap: options.sourceMap
    }
  }

  const postcssLoader = {
    loader: 'postcss-loader',
    options: {
      sourceMap: options.sourceMap
    }
  }

  // generate loader string to be used with extract text plugin
  function generateLoaders (loader, loaderOptions) {
    const loaders = options.usePostCSS ? [cssLoader, postcssLoader] : [cssLoader]

    if (loader) {
      loaders.push({
        loader: loader + '-loader',
        options: Object.assign({}, loaderOptions, {
          sourceMap: options.sourceMap
        })
      })
    }

    // Extract CSS when that option is specified
    // (which is the case during production build)
    if (options.extract) {
      return ExtractTextPlugin.extract({
        use: loaders,
        fallback: 'vue-style-loader'
      })
    } else {
      return ['vue-style-loader'].concat(loaders)
    }
  }

  // https://vue-loader.vuejs.org/en/configurations/extract-css.html
  return {
    css: generateLoaders(),
    postcss: generateLoaders(),
    less: generateLoaders('less'),
    sass: generateLoaders('sass', { indentedSyntax: true }),
    scss: generateLoaders('sass'),
    stylus: generateLoaders('stylus'),
    styl: generateLoaders('stylus')
  }
}

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = function (options) {
  const output = []
  const loaders = exports.cssLoaders(options)

  for (const extension in loaders) {
    const loader = loaders[extension]
    output.push({
      test: new RegExp('\\.' + extension + '$'),
      use: loader
    })
  }

  return output
}

exports.createNotifierCallback = () => {
  const notifier = require('node-notifier')

  return (severity, errors) => {
    if (severity !== 'error') return

    const error = errors[0]
    const filename = error.file && error.file.split('!').pop()

    notifier.notify({
      title: packageConfig.name,
      message: severity + ': ' + error.name,
      subtitle: filename || '',
      icon: path.join(__dirname, 'logo.png')
    })
  }
}

/**
 * @method 多页面配置
 * @explain 使用package.json配置路径
*/
const getEntry = () => { 
  const buildDirs = packageConfig.buildDirs; 
  return buildDirs;
};
exports.getEntry = getEntry;
exports.entries = function() {
  let entryObj = {};
  getEntry().forEach(item => {
      let paths = item.split('/');
      // console.info('item: ', item)
      // console.info('path: ', paths)
      entryObj[item + '/' + paths[paths.length - 1]] = `${entry_prefix}${item}/main.js`;
      paths = null;
  });
  // console.info('entryObj: ', entryObj)
  return entryObj;
};

exports.htmlPlugin = function() {
  let arr = [];
  getEntry().forEach(item => {
      let paths = item.split('/');
      let tempItem = item + '/' + paths[paths.length - 1];
      let templateFile = `${entry_prefix}${item}/index.html`;
      let filename = `html/${item}.html`;
      let conf = {
          template: templateFile,
          filename: filename,
          chunks: [ item + '/' + "manifest",  item + '/' + "vendor", tempItem],
          inject: true
      };
      // console.info('conf', conf)
      if (process.env.NODE_ENV === "production") {
          conf = merge(conf, {
              minify: {
                  removeComments: false,
                  collapseWhitespace: false,
                  removeAttributeQuotes: true
              },
              chunksSortMode: "dependency"
          });
      }
      arr.push(new HtmlWebpackPlugin(conf));
  });
  return arr;
};

/**
 * @explain 使用 glob
*/
// // glob是webpack安装时依赖的一个第三方模块，还模块允许你使用 *等符号, 例如lib/*.js就是获取lib文件夹下的所有js后缀名的文件
// var glob = require('glob')
// // 取得相应的页面路径，因为之前的配置，所以是src文件夹下的pages文件夹
// var PAGE_PATH = path.resolve(__dirname, '../src/pages')
//     // 用于做相应的merge处理
// var merge = require('webpack-merge')

// const getEntry = () => { 
// 	let entryFiles = glob.sync(PAGE_PATH + '/*/*.js');
// 	let buildDirs = [];

// 	entryFiles.forEach((filePath) => {
// 		let item = filePath.substring(filePath.indexOf('/pages/') + 7, filePath.lastIndexOf('/'));
// 		buildDirs.push(item)
// 	})
// 	return buildDirs;
// };
// exports.getEntry = getEntry;
// /**
//  * @method 多入口配置
//  * @param 通过glob模块读取pages文件夹,(**) 表示查找文件夹, *.js表示查找.js文件
// */
// exports.entries = function() {
//     let entryFiles = glob.sync(PAGE_PATH + '/*/*.js');
//     let entryObj = {};

//     getEntry().forEach((item) => {
// 		let paths = item.split('/');
//         entryObj[item + '/' + paths[paths.length - 1]] = `${entry_prefix}${item}/${item}.js`;
//         paths = null;
//     })
//     return entryObj;
// }

// /**
//  * @method 多页面输出配置
//  * @ 与上面的多页面入口配置相同，读取pages文件夹下的对应的html后缀文件，然后放入数组中
//  */
// exports.htmlPlugin = function() {
// 	let arr = [];
// 	getEntry().forEach(item => {
// 		let paths = item.split('/');
// 		let tempItem = item + '/' + paths[paths.length - 1];
// 		let templateFile = `${entry_prefix}${item}/index.html`;
// 		let filename = `html/${item}/index.html`;
// 		let conf = {
// 			template: templateFile,
// 			filename: filename,
// 			chunks: [ item + '/' + "manifest",  item + '/' + "vendor", tempItem],
// 			inject: true
// 		};
// 		console.info('conf', conf)
// 		if (process.env.NODE_ENV === "production") {
// 			conf = merge(conf, {
// 				minify: {
// 					removeComments: false,
// 					collapseWhitespace: false,
// 					removeAttributeQuotes: true
// 				},
// 				chunksSortMode: "dependency"
// 			});
// 		}
// 		arr.push(new HtmlWebpackPlugin(conf));
// 	});
// 	return arr;
// };
