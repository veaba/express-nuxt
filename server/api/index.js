/* eslint-disable import/first */
import {Router} from 'express'

const Mongodb = require('mongodb').MongoClient // es 语法引入mongodb
import users from './users' // 用户api
import {config, InitAdmin} from './../config' // 配置
const router = Router()

/*************************
 * @desc 授权方式访问数据，需要在mongodb中创建数据库并设置默认管理员账号密码开启授权模式
 * ************************/
function authMongodb () {
  return `${config.scheme}://${config.user}:${config.pwd}@${config.host}:${config.port}/${config.database}`
}

/** *****************数据库链接**************************/
// 链接数据库，如果没有则自动创建
function __connect (callback) {
  Mongodb.connect(authMongodb(), function (err, db) {
    if (err) {
      mongodbError()
      callback(err, null)
      return false
    } else {
      // 数据库链接成功执行回掉
      console.info('========== 链接成功 ==========')
      callback(err, db)
    }
  })
}

/**
 * @desc 数据库链失败警告
 * */

function mongodbError (err) {
  console.info('********** 链接失败 ↓ *********')
  console.info('* @name:' + err.name)
  console.info('* @message:' + err.message)
  console.info('* @ok:' + err.ok)
  console.info('* @errmsg:' + err.errmsg)
  console.info('* @code:' + err.code)
  console.info('* @codeName:' + err.codeName)
  console.info('********** 链接失败 ↑ *********')
}
/**
 * @desc 查询管理员
 * */
// function queryAdmin () {
//
// }

/**
 * @desc 插入数据
 * */
exports.insertOne = function (collectionName, json, callback) {
  __connect(function (err, db) {
    if (err) {
      mongodbError(err)
    }
    db.collection(collectionName).insertOne(json, function (err, result) {
      if (err) {
        callback(err, null)
        mongodbError(err)
        db.close()
        return false
      }
      callback(err, result)
      db.close()
    })
  })
}
/**
 * @desc 数据库链接初始化
 * @define  项目启动->找管理员用户->如果没有->查找失败->并开始初始化信息
 * */
function init () {
  console.info('---------初始化数据---------')

  __connect((err, db) => {
    if (err) {
      mongodbError()
    } else {
      let userCollection = db.collection(config.user)
      userCollection.find({'user': config.user}).toArray(function (err, result) {
        // 报错情况
        if (err) {
          mongodbError(err)
        }
        // 如果不等于零，不继续执行了
        if (result.length !== 0) {
          db.close()
        }
        userCollection.insertOne(InitAdmin, function (err, res) {
          console.info(err)
          if (err) {
            console.info('管理员初始化失败')
            mongodbError(err)
            db.close()
          }
          console.info('管理员初始化成功！')
          db.close()
        })
      })
    }
  })
}

// Add USERS Routes
router.use(users)

// MonGotest
router.post('/mongoTest', function (req, res, text) {
  init()
  console.info(req.body)
  res.json({loginStatus: 'success'})
})

export default router
