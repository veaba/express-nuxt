/* eslint-disable import/no-duplicates,no-unused-vars,handle-callback-err */
/***********************
 * @name JS
 * @author Jo.gel
 * @date 2017/11/12
 * @desc 开发下 backpack dev
 * @desc 生产环境下 nuxt build && nuxt start  && node ./server/index.js
 * 1、分别启动node 服务端和客户端。代理。不用nuxt.render作为中间器件，本身就是一个后端服务
 ***********************/
/* eslint-disable no-irregular-whitespace */

import express from 'express'
import { Nuxt, Builder } from 'nuxt'
import bodyParser from 'body-parser' // 必须，需要解析
import { router } from './router/index'
import session from 'express-session'
import {_webSocket} from './functions/functions' // 功能函数库
const path = require('path');
const logger = require('tracer').console()
const http = require('http'); // http 模块
const https = require('https'); // https 模块
const fs = require('fs');// 文件读写模块
const app = express()
const host = process.env.HOST || '0.0.0.0'
const port = process.env.PORT || 443
// Import and Set Nuxt.js options
let config = require('../nuxt.config.js')
config.dev = !(process.env.NODE_ENV === 'production')

// 创建socket服务
const server = app.listen(port + 1)
const io = require('socket.io')(server)
// body parser 封装req.body
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.set('port', port)
// Session 创建req.session
app.use(session({
  secret: 'super-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {maxAge: 6000000}
}))
/***************************************************
 * @desc webSocket Start Start Start Start Start ~~~
 * *************************************************/

// socket 连接
io.on('connection', _webSocket)
// 向所有用户发送消息
io.sockets.emit('isConnectSocketStatus', {msg: 'WebSocket is connected!'})

/**
 * @desc 小说下载完成，通知客户端,该方法为对server提供export
 * @param name novel {String}
 * @param data 消息 {Object}
 * */
async function _io (name, data) {
  return io.sockets.emit(name, data)
}
/***************************************************
 * @desc webSocket End End End End End End End End~~
 * *************************************************/

/* 验证https */
app.get('/.well-known/pki-validation/fileauth.txt', function (req, res) {
  return res.send('201809051049093duxerv3y362u2lje6nrvpsnzrjld2ptj05r9717mii512b3a5')
})
app.get('/', (req, res, next) => {
  res.send('hello world server! by @veaba')
})
// Import API Routes
app.use('/api', router)

// Init Nuxt.js
const nuxt = new Nuxt(config)
app.use(nuxt.render)
if (config.dev) {
  // Give nuxt middleware to express，用nuxt.js渲染每一个路由
  const builder = new Builder(nuxt)
  builder.build()
  logger.warn('开发环境下！使用nuxt.render作为中间器件启动服务');
  // 可以执行then方法
} else {
  logger.warn('生产环境下！分别启动nuxt start 和node服务器，前端做前后端分离处理。');
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
console.log('Server listening on ' + host + ':' + port) // eslint-disable-line no-console
console.log('webSocket Server listening on ' + host + ':' + (port + 1.0)) // eslint-disable-line no-console

export default _io
