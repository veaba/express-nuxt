/* eslint-disable no-unused-vars,no-unexpected-multiline */
/***********************
 * @name JS
 * @author Jo.gel
 * @date 9/9/2018
 * @desc ES6方式编写，服务端主体结构
 * @config NODE_NUXT = nuxt方式 启动服务器 nuxtDev:开发、nuxtStart 生产
 * @config NODE_RENDER = 编程方式启动服务器、backpack 或者node则调用服务器
 ***********************/
const router = require('./router/index')
const bodyParser = require('body-parser')
const session = require('express-session')
const forceSSL = require('express-force-ssl')
const { _webSocket } = require('./functions/functions')
const {Nuxt, Builder} = require('nuxt')
const express = require('express')// 编程的方式使用Nuxt
const mongoose = require('mongoose') // mongoose 库
const { UsersModel } = require('./model/model')
const { _dbError, _encryptedPWD } = require('./functions/functions')

const logger = require('tracer').console() // console追踪库
const path = require('path');
const http = require('http'); // http 模块
const http2 = require('spdy'); // spdy 模块，让express 支持http2
// const http2 = require('spdy'); // spdy 模块，让express 支持http2
// const https = require('https'); // https 模块
const fs = require('fs');// 文件读写模块
const app = express()
const httpsPort = process.env.PORT || 443
// https 证书
const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, './ssl/admingod.key')),
  cert: fs.readFileSync(path.join(__dirname, './ssl/admingod.pem'))
}
const http2Options = {
  key: fs.readFileSync(path.join(__dirname, './ssl/key.pem')),
  cert: fs.readFileSync(path.join(__dirname, './ssl/cert.pem')),
  'x-forwarded-for': true
}
const config = require('../nuxt.config.js')
const {configDB} = require('./config.js')

/**
 * @desc 配置数据库连接选项,访问数据库的通信证
 * */
const optionsDB = {
  poolSize: 5, // 线程池是什么鬼
  keepAlive: 30000,
  user: 'admin',
  pass: 'admin',
  useNewUrlParser: true
}
// 创建一个启动数据库并链接的函数，作为中间器件，只允许链接一次保持稳定
async function launchDB () {
  console.log('\x1B[32m%s\x1B[49m', '  ==============================')
  console.log('\x1B[32m%s\x1B[49m', ' ╞     Mongodb服务已启动 √   ╡  ')
  console.log('\x1B[32m%s\x1B[49m', '  ==============================')
  mongoose.connect(configDB.base + ':' + configDB.port + '/' + configDB.database, optionsDB, err => {
    if (err) {
      logger.warn('mongodb 数据库链接失败，请检查')
      logger.warn(err.message)
    }
  })
  let db = await mongoose.connection
  if (db) {
    let InitAdministrator = {
      username: 'admin',
      password: '123456',
      nick: 'admin',
      email: ''
    }
    db.once('connected', function () {
      logger.info('----------> 连接成功 ^_^------------')
      // 先查找存不存在admin 这个管理员账号
      UsersModel.find({'username': InitAdministrator.username}, function (err, res) {
        if (err) {
          _dbError(res, err)
        }
        // 查询为空会返回空数组
        if (res.length === 0) {
          InitAdministrator.password = _encryptedPWD(InitAdministrator.password) // 用户密码加密
          let adminModel = new UsersModel(InitAdministrator)
          adminModel.save(function (err, res) {
            if (err) {
              logger.info('----------> 初始化admin账号失败 v_v')
            } else {
              logger.info('----------> 初始化admin账号成功 ^_^')
            }
          })
        }
      })
    })
  }
}
launchDB()
config.dev = !(process.env.NODE_ENV === 'production')
config.nuxtDev = (process.env.NODE_NUXT === 'nuxtDev')// cnpm run nuxt-dev，nuxt开发环境 nuxt自动热更新
config.nuxtStart = (process.env.NODE_NUXT === 'nuxtStart')// cnpm run nuxt-dev，nuxt开发环境 nuxt自动热更新
config.backpackDev = (process.env.NODE_RENDER === 'backpackDev')// cnpm run backpack-dev 适合开发环境下，nuxt和express 都会自动热更新
config.server = (process.env.NODE_RENDER === 'server')// cnpm run backpack-dev 适合开发环境下，nuxt和express 都会自动热更新

// 创建WebSocket服务，加密的
const webSocket = http2.createServer(http2Options, app).listen(httpsPort + 1)
const io = require('socket.io')(webSocket)
io.on('connection', _webSocket) // socket 连接

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

/**
 * @desc 配置路由接口。
 * */
// 1、如果是cnpm run nuxt-dev：nuxt
if (config.nuxtDev || config.nuxtStart) {
  console.log('\x1B[31m%s\x1B[39m', '  nuxt dev')
  app.use(router)
}
/**
 * @desc 开发环境下 node/backpack
 * */
if (config.backpackDev || config.server) {
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
  app.set('forceSSLOptions', {
    enable301Redirects: true,
    trustXFPHeader: false,
    httpsPort: 443,
    sslRequiredMessage: 'SSL Required.'
  });
  app.use('/api', router)
  app.use(forceSSL)// SSL中间器件
  app.use(nuxt.render)
  console.log('\x1B[31m%s\x1B[39m', '  backpack dev')
  const builder = new Builder(nuxt)
  builder.build()
    .then(res => {
      console.log('\x1B[32m%s\x1B[49m', '  ==============================')
      console.log('\x1B[32m%s\x1B[49m', ' ╞     Nuxt服务已启动 √      ╡')
      console.log('\x1B[32m%s\x1B[49m', '  ==============================')
    })
    .catch(err => {
      logger.warn(err)
      console.log('\x1B[32m%s\x1B[49m', '  ==============================')
      console.log('\x1B[32m%s\x1B[49m', ' ╞     Nuxt服务已停止 √      ╡')
      console.log('\x1B[32m%s\x1B[49m', '  ==============================')
      process.exit(1)
    })
  // console.info(router);
  http.createServer(app).listen(80)// 80->443 一定要启用80端口
  http2.createServer(http2Options, app).listen(443)
  // https.createServer(httpsOptions, app).listen(443)
}

// @desc 以es5 require方式导出给node 支持es6语法的import index.js使用
module.exports = {
  path: '/api',
  handler: app,
  _io: async (name, data) => {
    return io.sockets.emit(name, data)
  }
}
