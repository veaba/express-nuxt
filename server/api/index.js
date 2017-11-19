/* eslint-disable import/first,no-unexpected-multiline,func-call-spacing,wrap-iife,new-cap,handle-callback-err,standard/object-curly-even-spacing */
import { Router } from 'express'
import mongoose from 'mongoose' // mongoose 库
import crypto from 'crypto' // node 中的加密模块

/**
 * @desc 密码加密模块
 * @desc 加盐'beike'，十六进制,加密算法sha256
 * */
function _PWD (password) {
  return crypto.createHmac('sha256', password)
    .update('beike')
    .digest('hex')
}

import UsersModel from './usersModel' // 用户api,构造函数应该是大写开头
const router = Router()
const socket = Router()

socket.get('/socket.io', function (req, res, text) {
  res.send(req.body)
})

/**
 * @desc 配置数据库连接选项,访问数据库的通信证
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
mongoose.connect('mongodb://127.0.0.1:27017/beike', options) // 连接
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
  console.info('----------> 开始初始化admin数据')
  // 初始化admin信息
  let InitAdministrator = {
    username: 'admin',
    password: '123456',
    nick: 'admin',
    email: ''
  }
  db.once('connected', function () {
    console.info('----------> 连接成功 ^_^------------')
    // 先查找存不存在admin 这个管理员账号
    UsersModel.find({'username': InitAdministrator.username}, function (err, res) {
      if (err) {
        console.info('error:' + err)
      }
      // 查询为空会返回空数组
      if (res.length > 0) {
        console.info('----------> 初始化时找到成功的数据 ^_^')
        console.info(res)
      } else {
        console.info('----------> 初始化时没有找到 v_v')
        // 为数据库新建默认admin信息
        InitAdministrator.password = _PWD(InitAdministrator.password) // 用户密码加密
        let adminModel = new UsersModel(InitAdministrator)
        adminModel.save(function (err, res) {
          if (err) {
            console.info('----------> 初始化admin账号失败 v_v')
          } else {
            console.info('----------> 初始化admin账号成功 ^_^')
            console.info(res)
          }
        })
      }
    })
  })
})()
/** ***************************** Routes ****************************************/
// Add USERS Routes
// router.use(users)
/**
 * @desc 用户登录
 * */
router.post('/login', async function (req, res, text) {
  console.info(req.session)
  let findUser = await UsersModel.find({username: req.body.username}).exec()
  let checkPwd = findUser[0] ? findUser[0].password : ''
  let inputPwd = await _PWD(req.body.password)
  if (findUser.length === 0) {
    res.json({
      errorCode: 1,
      msg: '该用户尚未注册'
    })
  } else {
    if (checkPwd === inputPwd) {
      console.info(req.session)
      req.session.isAuth = true
      res.json({
        errorCode: 0,
        msg: '登录成功'
      })
    } else {
      res.json({
        errorCode: 1,
        msg: '登录失败，密码错误'
      })
    }
  }
  console.info(findUser)
  console.info('后端密码：')
  console.info(checkPwd)
  console.info('前端密码:')
  console.info(inputPwd)
  console.info(checkPwd === inputPwd)
})

/**
 * @desc 注销登录 路由
 * */
router.post('/logout', function (req, res, text, {commit}) {
  req.session.isAuth = '~~~null~~~null'
  res.json({
    errorCode: 0,
    msg: '退出成功'
  })
  commit('SET_AUTH', req.session.isAuth)
})
/**
 * @desc 插入数据 路由
 * */
router.post('/insert', function (req, res, text) {
  insertData()
})

/**
 * @desc 查找用户是否存在函数
 * @return Boolean 查找到，返回密码，否则提示用户不存在
 * @param username
 * */

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
export { router, socket }
