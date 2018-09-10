/***********************
 * @name JS
 * @author Jo.gel
 * @date 9/7/2018
 * @desc 生产环境下，es6语法支持入口文件
 * @desc 如果使用nuxt.config.js 里面 配置文件。始终启动http服务的80端口，智障!
 *  serverMiddleware: [
 '  ~/server/index.js'
 ]
 ***********************/
require('babel-register');
if (process.env.NODE_NUXT === 'nuxtDev' || process.env.NODE_NUXT === 'nuxtStart') {
  const app = require('./import.js')
  module.exports = {
    path: '/api', // TODO 这个api干吗用的？
    handler: app
  }
  console.info('  nuxt 命令下 index es5语法');
} else {
  console.info('  node 命令下 index es5语法');
  require('./import.js')
}
console.error('  node 或者nuxt 命令访问入口文件index')
