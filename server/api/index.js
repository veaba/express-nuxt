/* eslint-disable import/first,no-unexpected-multiline,func-call-spacing,wrap-iife,new-cap,handle-callback-err,standard/object-curly-even-spacing */
import { Router } from 'express'
import mongoose from 'mongoose' // mongoose 库
import { config } from '../config' // 配置
import UsersModel from './usersModel' // 用户api,构造函数应该是大写开头
const router = Router()
const socket = Router()

socket.get('/socket.io', function (req, res, text) {
  res.send(req.body)
})

/**
 * @desc 配置数据库连接选项
 * */
let options = {
  db: {native_parser: true},
  server: {
    poolSize: 5,
    socketOptions: {keepAlive: 1}
  },
  user: 'admin',
  pass: 'admin'
}
mongoose.connect('mongodb://121.42.203.142:27017/beike', options) // 连接
let db = mongoose.connection

/** *********************** 数据库链接周期函数 *****************************/

/**
 * @desc 插入数据
 * */
function insertData () {
  console.info('------------- 插入数据 -------------')
  let InitUser = {
    username: 'admin',
    password: '123456',
    nick: 'admin',
    email: ''
  }
  let contentInsert = new UsersModel(InitUser)
  console.info(contentInsert)
  db.openSet('connected', function () {
    console.info('------------ 连接成功 ------------')
    contentInsert.save(function (err, res) {
      if (err) {
        console.info('error:' + err)
      } else {
        console.info('success' + res)
      }
    })
  })
}

/**********************************
 * @desc 数据库链接初始化，管理员
 * @define  项目启动->找管理员用户->如果没有->查找失败->并开始初始化信息
 * */

(function init () {
  console.info('--------- 开始初始化admin数据 ---------')
  // 初始化admin信息
  let InitAdministrator = {
    username: 'admin',
    password: '123456',
    nick: 'admin',
    email: ''
  }
  db.once('connected', function () {
    console.info('------------ ^_^ 连接成功 ^_^------------')
    // 先查找存不存在admin 这个管理员账号
    UsersModel.find({'username': InitAdministrator.username}, function (err, res) {
      if (err) {
        console.info('error:' + err)
      }
      // 查询为空会返回空数组
      if (res.length > 0) {
        console.info('------------^_^ 初始化时找到成功的数据 ^_^------------')
        console.info('success：' + res)
      } else {
        console.info('------------v_v 初始化时没有找到 v_v------------')
        // 为数据库新建默认admin信息
        let adminModel = new UsersModel(InitAdministrator)
        adminModel.save(function (err, res) {
          if (err) {
            console.info('error:' + err)
          } else {
            console.info('success:' + res)
          }
        })
      }
    })
  })
})()

/**
 * @desc 连接断开
 * */

/***********************************************************************/
// Add USERS Routes
// router.use(users)

// MonGotest
router.post('/mongoTest', function (req, res, text) {
  console.info(req.body)
  res.json({loginStatus: 'success'})
})

/**
 * @desc 插入数据 路由
 * */
router.post('/insert', function (req, res, text) {
  insertData()
})

/**
 * @desc 查询数据 路由
 * */
router.post('/find', function (req, res, text) {
  res.json({loginStatus: 'success'})
  db.openSet('connected', function () {
    UsersModel.find({}, function (err, res) {
      if (err) {
        console.info('error:' + err)
      } else {
        console.info('success:' + res)
      }
    })
  })
})

/**
 * @desc 1 走/*方式 向外暴露一个webSocket
 * @desc 2 走/api/*
 * */
// const api = router
export {router, socket}
