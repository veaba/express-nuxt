/* eslint-disable import/no-duplicates */
/***********************
 * @name JS
 * @author Jo.gel
 * @date 2017/11/12
 ***********************/
/* eslint-disable no-irregular-whitespace */
import express from 'express'
import { Nuxt, Builder } from 'nuxt'
import bodyParser from 'body-parser' // 必须，需要解析
import { router } from './api'
const app = express()
const host = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 5000
// 创建socket服务
const server = app.listen(port + 1)
const io = require('socket.io')(server)
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.set('port', port)

// Import API Routes
app.use('/api', router)
// app.use('', socket)

/*********************
 * @desc webSocket
 * *******************/
io.on('connection', function (socket) {
  console.info('socketl 链接了吗')
  socket.emit('news', {hello: 'world'})
  socket.on('my other event', function (data) {
    console.info(222)
    console.log(data)
  })
})

// Import and Set Nuxt.js options
let config = require('../nuxt.config.js')
config.dev = !(process.env.NODE_ENV === 'production')

// Init Nuxt.js
const nuxt = new Nuxt(config)

// Build only in dev mode
if (config.dev) {
  const builder = new Builder(nuxt)
  builder.build()
  // 可以执行then方法
}

// Give nuxt middleware to express
app.use(nuxt.render)

// Listen the server
app.listen(port, host)
console.log('Server listening on ' + host + ':' + port) // eslint-disable-line no-console
