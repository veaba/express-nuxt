/* eslint-disable import/first,no-unexpected-multiline,func-call-spacing,wrap-iife,new-cap,handle-callback-err,standard/object-curly-even-spacing */
import {Router} from 'express'
import mongoose from 'mongoose' // mongoose 库
import crypto from 'crypto' // node 中的加密模块
const logger = require('tracer').console() // console追踪库
import {config} from '../config'
import {UsersModel, RouterModel, ArticleModel} from './model' // 用户api,构造函数应该是大写开头
const router = Router()

/**
 * @desc 密码加密模块
 * @desc 加盐'beike'，十六进制,加密算法sha256
 * */
function encryptedPWD (password) {
  return crypto.createHmac('sha256', password)
    .update('beike')
    .digest('hex')
}

/**
 * @desc 配置数据库连接选项,访问数据库的通信证
 * */
let options = {
  // useMongoClient: true,
  db: {native_parser: true},
  server: {
    // ssl: true, // ssl
    poolSize: 5, // 线程池是什么鬼
    socketOptions: {
      keepAlive: 30000
      // connectTimeoutMS: 30000 // 链接超时
    }
    // auto_reconnect: true, // 自动链接
    // reconnectTries: 300000, // 重新链接
    // reconnectInterval: 5000 // 重新连接间隔
  },
  // promiseLibrary: global.Promise,
  user: 'admin',
  pass: 'admin'
}

mongoose.connect(config.base + ':' + config.port + '/' + config.database, options) // 连接
let db = mongoose.connection

/** *********************** 数据库链接周期函数 *****************************/

/**
 * @desc 插入数据
 * */
function insertData () {
  logger.info('------------- 插入数据 -------------')
  let InitUser = {
    username: 'admin',
    password: '123456',
    nick: 'admin',
    email: ''
  }
  let contentInsert = new UsersModel(InitUser)
  logger.info(contentInsert)
  db.openSet('connected', function () {
    contentInsert.save(function (err, res) {
      if (err) {
        // logger.info('error:' + err)
      } else {
        // logger.info('success' + res)
      }
    })
  })
}

/**********************************
 * @desc 数据库链接初始化，管理员
 * @define  项目启动->找管理员用户->如果没有->查找失败->并开始初始化信息
 * */

(function init () {
  // 初始化admin信息
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
        // console.info('error:' + err)
      }
      // 查询为空会返回空数组
      if (res.length > 0) {
        // logger.info('----------> 初始化时找到成功的数据 ^_^')
        // logger.info(res)
      } else {
        // logger.info('----------> 初始化时没有找到 v_v')
        // 为数据库新建默认admin信息
        InitAdministrator.password = encryptedPWD(InitAdministrator.password) // 用户密码加密
        let adminModel = new UsersModel(InitAdministrator)
        adminModel.save(function (err, res) {
          if (err) {
            // logger.info('----------> 初始化admin账号失败 v_v')
          } else {
            // logger.info('----------> 初始化admin账号成功 ^_^')
            // logger.info(res)
          }
        })
      }
    })
  })
})()
/** ***************************** Routes ****************************************/
/**
 * @desc 用户登录
 * */
router.post('/login', async function (req, res, next) {
  let findUser = await UsersModel.find({username: req.body.username}).exec()
  let checkPwd = findUser[0] ? findUser[0].password : ''
  let inputPwd = await encryptedPWD(req.body.password)
  if (findUser.length === 0) {
    // TODO 频繁的操作
    res.json({
      errorCode: 1,
      msg: '该用户尚未注册'
    })
  } else {
    // 密码正确
    if (checkPwd === inputPwd) {
      // TODO 配置用户的到session
      req.session.userInfo = {
        id: findUser[0]._id,
        username: findUser[0].username, // 用户名
        nick: findUser[0].nick || null, // 用户名
        email: findUser[0].email || null, // 用户名
        isLogin: true
      }
      req.session.isAuth = true
      // logger.error(req.session)
      res.json({
        errorCode: 0,
        msg: '登录成功'
      })
      // logger.error(findUser)// 登录成功后返回的数据
    } else {
      res.json({
        errorCode: 1,
        msg: '登录失败，密码错误'
      })
    }
  }
})

/**
 * @desc 注销登录 路由
 * */
router.post('/logout', function (req, res, next) {
  req.session.isAuth = null
  logger.error(req.session)
  res.json({
    errorCode: 0,
    msg: '退出成功'
  })
})

/**
 * @desc 注册账号 路由
 * */
router.post('/register', function (req, res, next) {
  logger.error(req.session)
  if (req.session.isAuth) {
    res.json({
      errorCode: 0,
      msg: '你可以注册啦！'
    })
  } else {
    res.json({
      errorCode: 3,
      msg: '你丫没人权！'
    })
  }
})

/**
 * @desc 插入数据 路由
 * */
router.post('/insert', function (req, res, next) {
  insertData()
})

/**
 * @desc 查找用户是否存在函数
 * @return Boolean 查找到，返回密码，否则提示用户不存在
 * @param username
 * */

/**
 * @desc 查询用户 路由
 * */
// router.post('/find', function (req, res, next) {
//   res.json({loginStatus: 'success'})
//   db.openSet('connected', function () {
//     UsersModel.find({}, function (err, res) {
//       if (err) {
//         logger.info('error:' + err)
//       } else {
//         logger.info('success:' + res)
//       }
//     })
//   })
// })

/*******************************************************************
 * @desc 查询路由的数据
 * */
router.post('/getRouterList', async function (req, res, next) {
  let data = req.body.name ? ({name: req.body.name}) : {}
  console.info(data)
  let findRouter = await RouterModel.find(data).exec()
  if (findRouter.length === 0) {
    res.json({errorCode: 1, data: [], msg: '尚无路由数据'})
  } else {
    res.json({errorCode: 0, data: findRouter, msg: 'success'})
  }
})

/**
 * @desc 添加路由操作
 * */
router.post('/addRouter', async function (req, res, next) {
  console.info('添加路由')
  let findRouter = await RouterModel.find({name: req.body.name})
  // 1、已存在
  if (findRouter.length > 0) {
    res.json({
      errorCode: 2,
      msg: '已存在'
    })
  } else {
    // 如果没有存在，则允许继续添加
    logger.error(req.body)
    // 插入数据
    let saveRouter = new RouterModel(req.body, false)
    saveRouter.save(function (err, resdb) {
      if (err) {
        res.json({
          errorCode: 4,
          msg: 'error'
        })
      } else {
        logger.error(resdb)
        res.json({
          errorCode: 0,
          msg: 'success'
        })
      }
    })
  }
})

/**
 * @desc 删除路由操作
 * */
router.post('/deleteRouter', async function (req, res, next) {
  console.info('删除路由')
  let data = req.body
  console.info(data)
  if (data.length === 0) {
    res.json({
      errorCode: 4,
      msg: '路由名称为为空'
    })
    return false
  } else {
    // 传递正常
    // 1 先查询存在该路由名称
    if (queryRouter(data)) {
      // 开始删除操作
      let delRouter = await RouterModel.remove(data).exec()
      logger.error(delRouter)
      if (delRouter.ok) {
        res.json({
          errorCode: 0,
          msg: 'success'
        }
        )
      } else {
        res.json({
          errorCode: 4,
          msg: 'error 删除失败'
        })
      }
    } else {
      // 2、否则，不存在路由
      res.json({
        errorCode: 1,
        msg: 'error 不存在该路由，无法删除路由'
      })
    }
  }
})

/**
 * @desc 查询路由名称
 * */
async function queryRouter (req, res, next) {
  let findRouter = await RouterModel.find(req)
  if (findRouter.length > 0) {
    logger.error(findRouter)
    return findRouter
  } else {
    logger.error(findRouter)
    return findRouter
  }
}

/*******************************************************************
 * @desc 查询文章的数据
 * */
router.get('/article', async function (req, res, next) {
  console.info('查询文章')
  let findArticle = await ArticleModel.find({}).exec()
  logger.error(findArticle)
})

/**
 * @desc 获取用户身份信息
 * */
router.get('/user', function (req, res, text) {
  // 如果session 存在则判断用户在登录状态
  if (req.session && req.session.isAuth) {
    res.json({
      errorCode: 0,
      data: req.session.userInfo
    })
  }
})
export {router}
