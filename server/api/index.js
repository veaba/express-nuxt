import { Router } from 'express'
const Mongodb = require('mongodb').MongoClient // es 语法引入mongodb
import users from './users' // 用户api
import config from './../config' // 数据库配置文件
const router = Router()

/*******************数据库链接**************************/
// 链接数据库，如果没有则自动创建
function _connectDB (callback) {
  Mongodb.connect(config.host, function (err, db) {
    if (err) {
      console.info(err)
      callback(err, null)// ？用途
      return false
    } else {
      // 数据库链接成功执行回掉
      console.info('~~~~~~~~~~链接成功~~~~~~~~~~')
      callback(err, db)
    }
  })
}

/**
 * @desc 数据库链接初始化
 * @define  项目启动->找管理员用户->如果没有->查找失败->并开始初始化信息
 * */
(function init() {
  console.info('init')
  _connectDB(function (err,db) {
    const userCollection =db.collection('users')
    userCollection.find({'user':user}).toArray(function (err,result) {
      
    })
    if(err){

    }else {
      //
    }
  })
})()


// Add USERS Routes
router.use(users)

//MonGotest
router.post('/mongoTest',function (req, res, text) {
  _connectDB()
  console.info(req.body)
  console.info(config)
  res.json({loginStatus: 'success'})
})

export default router
