/***********************
 * @name JS
 * @author Jo.gel
 * @date 9/9/2018
 * @desc ES6方式编写，服务端主体结构
 * @config NODE_NUXT = nuxt方式 启动服务器 nuxtDev:开发、nuxtStart 生产
 * @config NODE_RENDER = 编程方式启动服务器、backpack 或者node则调用服务器
 ***********************/
import express from 'express'
import router from './router/index'
import bodyParser from 'body-parser'
import session from 'express-session'
import forceSSL from 'express-force-ssl'
import { _webSocket } from './functions/functions'
import {Nuxt, Builder} from 'nuxt'// 编程的方式使用Nuxt

const logger = require('tracer').console() // console追踪库
const path = require('path');
const http = require('http'); // http 模块
const https = require('https'); // https 模块
const fs = require('fs');// 文件读写模块
const app = express()
const port = process.env.PORT || 443
let config = require('../nuxt.config.js')
const nuxt = new Nuxt(config)

/**
 * @desc nuxt钩子
 * */
nuxt.hook('ready', async nuxt => {
  // nuxt 钩子-Nuxt准备好工作了：ModuleContainer 和 Renderer
  console.log('\x1B[31m%s\x1B[39m', '  Nuxt 准备好了 ModuleContainer 和 Renderer')
})

nuxt.hook('error', async nuxt => {
  // nuxt 钩子-调用钩子时未处理的错误
  console.log('\x1B[31m%s\x1B[39m', '  Nuxt 准备好了 ModuleContainer 和 Renderer')
})
nuxt.hook('close', async nuxt => {
  // nuxt 钩子-Nuxt实例被关闭
  console.log('\x1B[31m%s\x1B[39m', '  Nuxt实例被关闭')
})
nuxt.hook('listen', async (server, host, port) => {
  // nuxt 钩子-Nuxt 内部服务器开启帧听.使用nuxt start,和nuxt dev
  logger.warn(server, host, port)
  console.log('\x1B[31m%s\x1B[39m', '  Nuxt 内部服务器开启帧听.使用nuxt start,和nuxt dev')
})
config.dev = !(process.env.NODE_ENV === 'production')
config.nuxtDev = (process.env.NODE_NUXT === 'nuxtDev')// cnpm run nuxt-dev，nuxt开发环境 nuxt自动热更新
config.nuxtStart = (process.env.NODE_NUXT === 'nuxtStart')// cnpm run nuxt-dev，nuxt开发环境 nuxt自动热更新
config.backpackDev = (process.env.NODE_RENDER === 'backpackDev')// cnpm run backpack-dev 适合开发环境下，nuxt和express 都会自动热更新
config.server = (process.env.NODE_RENDER === 'server')// cnpm run backpack-dev 适合开发环境下，nuxt和express 都会自动热更新
// 创建WebSocket服务
const webSocket = app.listen(port + 1)
const io = require('socket.io')(webSocket)
// socket 连接
io.on('connection', _webSocket)
/**
 * @desc 小说下载完成，通知客户端,该方法为对server提供export
 * @param name novel {String}
 * @param data 消息 {Object}
 * */
async function _io (name, data) {
  return io.sockets.emit(name, data)
}

// 请求体解析
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

console.info(config);
// Session 创建req.session
app.use(session({
  secret: 'super-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {maxAge: 6000000}
}))
app.set('forceSSLOptions', {
  enable301Redirects: true,
  trustXFPHeader: false,
  httpsPort: 443,
  sslRequiredMessage: 'SSL Required.'
});
app.use(forceSSL)// SSL中间器件
app.use('/api', router)
/**
 * @desc 配置路由接口。
 * */
// 1、如果是cnpm run nuxt-dev：nuxt
if (config.nuxtDev || config.nuxtStart) {
  console.log('\x1B[31m%s\x1B[39m', '  nuxt dev')
  // app.use('/api', router)// 为什么nuxt-dev无法调用这个路由??
}
if (config.backpackDev || config.server) {
  // app.use('/api', router)
  app.use(nuxt.render)
  console.log('\x1B[31m%s\x1B[39m', '  backpack dev')
  const builder = new Builder(nuxt)
  builder.build()
    .then(res => {
      console.log('\x1B[32m%s\x1B[49m', '  ==============================')
      console.log('\x1B[32m%s\x1B[49m', ' ║      Nuxt服务已启动 √    ║')
      console.log('\x1B[32m%s\x1B[49m', '  ==============================')
    })
    .catch(err => {
      logger.warn(err)
      console.log('\x1B[32m%s\x1B[49m', '  ==============================')
      console.log('\x1B[32m%s\x1B[49m', ' ║      Nuxt服务已停止 √    ║')
      console.log('\x1B[32m%s\x1B[49m', '  ==============================')
      process.exit(1)
    })
}

/**
 * @desc https 配置参数对象
 * */
const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, './ssl/admingod.key')),
  cert: fs.readFileSync(path.join(__dirname, './ssl/admingod.pem'))
}
http.createServer(app).listen(80)
https.createServer(httpsOptions, app).listen(443)

/**
 * @desc Hello world
 * */
app.get('/api', forceSSL, function (req, res) {
  logger.warn('Welcome to Server API pages!')
  return res.send('HTTPS only.');
});
// @desc 以es5 require方式导出给node 支持es6语法的import index.js使用
module.exports = app
export default {_io}
