/* eslint-disable import/first,no-unexpected-multiline,func-call-spacing,wrap-iife,new-cap,handle-callback-err,standard/object-curly-even-spacing */
import {Router} from 'express'
import usersModel from './usersModel' // 用户api
import mongoose from 'mongoose' // mongoose 库
import {config} from '../config' // 配置
const router = Router()

/*************************
 * @desc 授权方式访问数据，需要在mongodb中创建数据库并设置默认管理员账号密码开启授权模式
 * ************************/
function authMongodb () {
  return `${config.scheme}://${config.user}:${config.pwd}@${config.host}:${config.port}/${config.database}`
}
/** *********************** 数据库链接周期函数 *****************************/

/** *****************数据库链接**************************/

/**
 * @desc 插入数据
 * */
function insertData () {
  console.info('------------- 插入数据 -------------')
  /**
   * @desc 连接数据库
   * **/
  mongoose.connect(authMongodb(), { server: {socketOptions: {keepAlive: 1}} }) // 连接
  let db = mongoose.connection

  /**
   * @desc 连接成功
   * */
  db.openSet('connected', function () {
    console.info('------------ 连接成功 ------------')
    console.info('连接参数：' + authMongodb())
    usersModel.find(function (err, res) {
      if (err) {
        console.info(err)
      } else {
        console.info(res)
      }
    })
  })
}

/**********************************
 * @desc 数据库链接初始化
 * @define  项目启动->找管理员用户->如果没有->查找失败->并开始初始化信息
 * */

function init () {
  console.info('--------- 开始 *初始化数据 ↓ ---------')
}

/**
 * @desc 连接断开
 * */

/***********************************************************************/
// Add USERS Routes
// router.use(users)

// MonGotest
router.post('/mongoTest', function (req, res, text) {
  init()
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
  usersModel.find({'user': 'admin'}, function (err, res) {
    if (err) {
      console.info(err)
    } else {
      console.info(res)
    }
  })
})

export default router
