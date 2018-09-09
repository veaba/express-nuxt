/***********************
 * @name JS
 * @author Jo.gel
 * @date 9/9/2018
 * @desc ES6方式编写，服务端主体结构
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
config.dev = !(process.env.NODE_ENV === 'production')
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
app.use('/api', router)// 需要在nuxt.render之前
app.use(forceSSL)
/**
 * @desc Nuxt 中间器件
 * @todo 可能需要后期需要区分 热更新、开发环境下的用途
 * */
app.use(nuxt.render)
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
/**
 * @desc https 配置参数对象
 * */
const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, './ssl/admingod.key')),
  cert: fs.readFileSync(path.join(__dirname, './ssl/admingod.pem'))
}
http.createServer(app).listen(80)
https.createServer(httpsOptions, app).listen(443)

app.get('/api', forceSSL, function (req, res) {
  logger.warn('Welcome to Server API pages!')
  return res.send('HTTPS only.');
});

// @desc 以es5 require方式导出给node 支持es6语法的import index.js使用
module.exports = app
export default {_io}
