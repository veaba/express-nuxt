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
require('./import.js')
