/**
 * @TODO 时候在后期对error的操作，同样写入到log中，从而追踪系统的运行状态
 * @desc 数据库操作
 * */
/* eslint-disable import/first,no-unexpected-multiline,func-call-spacing,wrap-iife,new-cap,handle-callback-err,standard/object-curly-even-spacing */
import { Router } from 'express'
import mongoose from 'mongoose' // mongoose 库
import crypto from 'crypto' // node 中的加密模块
const logger = require('tracer').console() // console追踪库
import { config } from '../config'
import { UsersModel, RouterModel, ArticleModel } from './model' // 用户api,构造函数应该是大写开头
import { format } from 'date-fns'

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

/** *********************很诡异的报错，如果没有一个函数在db 后面，则报一个错误**************************/
/**
 * @desc mongodb 操作失败函数
 * @res res
 * @err err
 * @errorCode 错误代码
 * */
function dbError (res, err, errorCode) {
  return res.json({
    errorCode: errorCode || 1,
    msg: err || '服务端错误'
  })
}

/**
 * @desc mongodb 操作成功函数,返回到前端
 * @res res
 * @err err
 * @errorCode 错误代码
 * */
function dbSuccess (res, data, errorCode, msg) {
  return res.json({
    errorCode: errorCode || 0,
    data: data || [],
    msg: msg || '操作成功'
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
        dbError(res, err)
      }
      // 查询为空会返回空数组
      if (res.length === 0) {
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
 * @desc 每次进入 /xx 非页面路由都会调用这个接口，也就是后端路由
 * @desc 这时，使用router 的中间器件，函数来判断是否存在,
 * //todo 路由请求和mongodb 处理函数区分开
 * @desc 路由查询接口，查询路由是否有效
 * */
/**
 * @swagger
 * /api/puppies:
 *   get:
 *     tags:
 *       - Puppies
 *     description: Returns all puppies
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of puppies
 *         schema:
 *           $ref: '#/definitions/Puppy'
 */
router.get('/router', async function (req, res, next) {
  let router = await RouterModel.find({'name': req.query.router}).exec()
  logger.error(router)
  if (router.length === 0) {
    console.info('无效')
    req.session.routerLock = true // 路由锁定,auth.js ，直接error({报错处理})
    res.json({
      errorCode: 1,
      msg: '404用户'
    })
  } else {
    console.info(' 有效')
    req.session.routerLock = false
    res.json({
      errorCode: 0,
      data: [],
      msg: '操作成功'
    })
    // TODO拉取用户信息
  }
})
// router.use(async function (req, res, next) {
//   console.info('Time-----------:', Date.now())
//   logger.error('router 中间器件执行')
//   // 管理routerLock
//   if (req.query && req.query.router) {
//     let router = await RouterModel.find({'name': req.query.router}).exec()
//     logger.error(router)
//     console.info('0000')
//     if (router.length === 0) {
//       console.info('1111')
//       req.session.routerLock = true
//     } else {
//       console.info('2222')
//       req.session.routerLock = false
//     }
//   } else {
//     console.info('3333')
//     req.session.routerLock = false
//   }
//   next()
// })
/**
 * @desc 用户登录
 * */
router.post('/login', async function (req, res, next) {
  let findUser = await UsersModel.find({username: req.body.username}).exec()
  let checkPwd = findUser[0] ? findUser[0].password : ''
  let inputPwd = await encryptedPWD(req.body.password)
  if (findUser.length === 0) {
    // TODO 频繁的操作
    return res.json({
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
      return res.json({
        errorCode: 0,
        msg: '登录成功'
      })
      // logger.error(findUser)// 登录成功后返回的数据
    } else {
      return res.json({
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
  return res.json({
    errorCode: 0,
    msg: '退出成功'
  })
})

/**
 * @desc 注册账号 路由 TODO
 * */
router.post('/register', function (req, res, next) {
  logger.error(req.session)
  if (req.session.isAuth) {
    return res.json({
      errorCode: 0,
      msg: '你可以注册啦！'
    })
  } else {
    return res.json({
      errorCode: 3,
      msg: '你丫没人权！'
    })
  }
})

/*******************************************************************
 * @desc 查询路由的数据
 * */
router.get('/getRouterList', async function (req, res, next) {
  let data = req.query.name ? ({name: req.query.name}) : {}
  // TODO 增加模糊查询，匹配 name status:{normal,keep,ban},type:{official,brand,user}
  let findRouter = await RouterModel.find(data).exec()
  if (findRouter.length === 0) {
    return res.json({errorCode: 1, data: [], msg: '尚无路由数据'})
  } else {
    return res.json({errorCode: 0, data: findRouter, msg: 'success'})
  }
})

/**
 * @method POST
 * @desc 添加路由操作
 * */
router.post('/addRouter', async function (req, res, next) {
  console.info('添加路由')
  let findRouter = await RouterModel.find({name: req.body.name})
  // 1、已存在
  if (findRouter.length > 0) {
    return res.json({
      errorCode: 2,
      msg: '已存在'
    })
  } else {
    // 如果没有存在，则允许继续添加
    // 插入数据
    let saveRouter = new RouterModel(req.body, false)
    saveRouter.save(function (err, resDB) {
      if (err) {
        return res.json({
          errorCode: 4,
          msg: 'error'
        })
      } else {
        return res.json({
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
    return res.json({
      errorCode: 4,
      msg: '路由名称为为空'
    })
  } else {
    // 传递正常
    // 1 先查询存在该路由名称
    if (queryRouter(data)) {
      // 开始删除操作
      let delRouter = await RouterModel.remove(data).exec()
      if (delRouter.ok) {
        return res.json({
          errorCode: 0,
          msg: 'success'
        }
        )
      } else {
        return res.json({
          errorCode: 4,
          msg: 'error 删除失败'
        })
      }
    } else {
      // 2、否则，不存在路由
      return res.json({
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
  return findRouter
}

/*******************************************************************
 * @desc 查询文章的数据
 * */
router.get('/getArticleList', async function (req, res, next) {
  let data = req.query.name ? ({name: req.query.title}) : {}
  // TODO 增加模糊查询
  let findArticle = await ArticleModel.find(data).exec()
  if (findArticle.length === 0) {
    return res.json({errorCode: 1, data: [], msg: '尚无路由数据'})
  } else {
    return res.json({errorCode: 0, data: findArticle, msg: 'success'})
  }
})

/**
 * @desc  发表新的文章 ＋编辑文章 //todo 没有login 时候，无法发表，或无返回
 * */
router.post('/publishArticle', async function (req, res, next) {
  let data = req.body
  if (data._id) {
    logger.error('编辑 文章')
    let objectId = mongoose.Types.ObjectId(data._id)
    data.post_modified = format(new Date(), 'YYYY-MM-DD HH:mm:ss')
    data.editor_number = (data.editor_number || 0) + 1
    ArticleModel.findByIdAndUpdate({_id: objectId}, data, {upsert: true}, function (err, db1) {
      if (err) {
        logger.error('编辑文章 失败')
        dbError(res, err)
      } else {
        logger.error('编辑文章 成功')
        dbSuccess(res)
      }
    })
  } else {
    // 首次新增的文章,补充新字段
    data.comments_status = 'open' // 评论开放 * 后期
    data.post_modified = '' // 修改时间 * 后期
    data.post_author = req.session.userInfo.id
    data.editor_number = 0

    // 摘要处理
    if (!data.post_abstract) {
      data.post_abstract = (data.post_content || '').slice(0, 50) || ''
    }
    let saveArticle = new ArticleModel(data) // 创建构造函数，此时 增加_id
    saveArticle.save()
      .then(function (resDb) {
        logger.error('新增 文章')
        let id = mongoose.Types.ObjectId(resDb._id) // 构造id
        let postDate = format(id.getTimestamp(), 'YYYY-MM-DD HH:mm:ss')
        ArticleModel.findByIdAndUpdate(resDb, {post_date: postDate}, {upsert: true}, function (err, db1) {
          if (err) {
            logger.error('新增文章 失败')
            dbError(res, err)
          } else {
            logger.error('新增文章 成功')
            dbSuccess(res)
          }
        })
      })
  }
})

/**
 * @desc  编辑单篇文章
 * */
router.post('editArticle', async function (req, res, text) {
  let data = req.body
  dbSuccess(res, data)
})
/**
 * @desc 拉取单篇文章
 * */
router.get('/getArticle', async function (req, res, text) {
  let id = req.query.id
  if (!id) {
    dbError(res)
    return false
  } else {
    let objectId = mongoose.Types.ObjectId(id)
    ArticleModel.findOne({_id: objectId})
      .then(function (resDb) {
        dbSuccess(res, resDb)
      })
      .catch(function (err) {
        dbError(res, err)
      })
  }
})

/**
 * @desc 删除文章
 * @desc 支持数组形式
 * */
router.post('/deletesArticle', async function (req, res, text) {
  let data = req.bdoy
  dbSuccess(res, data)
})

/**
 * @desc 获取用户身份信
 * */
router.get('/user', function (req, res, text) {
  // 如果session 存在则判断用户在登录状态
  if (req.session && req.session.isAuth) {
    return res.json({
      errorCode: 0,
      data: req.session.userInfo
    })
  } else {
    dbError(res, '你尚未登录，无权限获取用户信息，', 403)
  }
})

/***********************************
 * @desc express router 路由中间器件，用来判断是不是合法的路由，否则路由上锁 routerLock
 * */

export { router }
