/* eslint-disable import/no-duplicates,no-unused-vars,handle-callback-err */
/***********************
 * @name JS
 * @author Jo.gel
 * @date 2017/11/12
 ***********************/
/* eslint-disable no-irregular-whitespace */
import express from 'express'
import { Nuxt, Builder } from 'nuxt'
import bodyParser from 'body-parser' // 必须，需要解析
import { router } from './router/index'
import session from 'express-session'
import {_webSocket} from 'functions/functions' // 功能函数库
const logger = require('tracer').console()
const app = express()
const host = process.env.HOST || '0.0.0.0'
const port = process.env.PORT || 4000

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
// todo 授权连接

/**
 * @desc 小说下载完成，通知客户端,该方法为对server提供export
 * @param name novel {String}
 * @param data 消息 {Object}
 * */
async function _io (name, data) {
  logger.warn('小说下载完成，通知客户端!')
  return io.sockets.emit(name, data)
}
/***************************************************
 * @desc webSocket End End End End End End End End~~
 * *************************************************/

// Import API Routes
app.use('/api', router)

// Import and Set Nuxt.js options
let config = require('../nuxt.config.js')
config.dev = !(process.env.NODE_ENV === 'production')

// Init Nuxt.js
const nuxt = new Nuxt(config)

// Build only in dev mode
// html,error,redirected
if (config.dev) {
  const builder = new Builder(nuxt)
  builder.build()
  // 可以执行then方法
}

// Give nuxt middleware to express，用nuxt.js渲染每一个路由
app.use(nuxt.render)

/**
 * @desc 日志错误处理，通过logErrors 可能将请求和错误信息写入到stderr
 * */
function logErrors (err, req, res, next) {
  console.error(err.stack)
  next(err)
}

/**
 * @desc 客户端错误处理，错误会显式传递到下一项
 * */
function clientErrorHandler (err, req, res, next) {
  if (req.xhr) {
    res.status(500).send({errorCode: -1, msg: 'Something faild!'})
  }
}

/**
 * @desc 错误处理
 * */
function errorHandler (err, req, res, next) {
  if (req.headersSet) {
    return next(err)
  }
  res.status(500)
  res.render('error', {error: err})
}

// app.use(logErrors)
// app.use(clientErrorHandler)
// app.use(errorHandler)
// Listen the server
app.listen(port, host)
console.log('Server listening on ' + host + ':' + port) // eslint-disable-line no-console
console.log('webSocket Server listening on ' + host + ':' + port + 1.0) // eslint-disable-line no-console

export default _io
