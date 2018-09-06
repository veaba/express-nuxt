/* eslint-disable no-dupe-keys,no-unused-vars */
/**
 * @TODO 时候在后期对error的操作，同样写入到log中，从而追踪系统的运行状态
 * @desc 数据库操作
 * */
/* eslint-disable import/first,no-unexpected-multiline,func-call-spacing,wrap-iife,new-cap,handle-callback-err,standard/object-curly-even-spacing */
import {Router} from 'express'
import mongoose from 'mongoose' // mongoose 库
const logger = require('tracer').console() // console追踪库
import {config} from '../config'
import {UsersModel} from '../model/model' // 用户api,构造函数应该是大写开头
import {_dbError, _encryptedPWD} from '../functions/functions'
import _article from '../controllers/articles' // 文章操作函数
import _novel from '../controllers/novels' // 小说下载操作函数
import _router from '../controllers/routers' // 路由相关操作函数
import _public from '../controllers/publics' // 公开相关操作函数
import _user from '../controllers/users' // 用户相关操作函数
const router = Router()

/**
 * @desc 配置数据库连接选项,访问数据库的通信证
 * */
let options = {
  // db: {native_parser: true},
  poolSize: 5, // 线程池是什么鬼
  keepAlive: 30000,
  user: 'admin',
  pass: 'admin'
}

mongoose.connect(config.base + ':' + config.port + '/' + config.database, options, err => {
  if (err) {
    logger.warn('mongodb 数据库链接失败，请检查')
    logger.warn(err.message)
  }
}) // 连接
/**********************************
 * @desc 数据库链接初始化，管理员
 * @define  项目启动->找管理员用户->如果没有->查找失败->并开始初始化信息
 * */
const connect = async function () {
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
          // logger.info('----------> 初始化时没有找到 v_v')
          // 为数据库新建默认admin信息
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
connect()
/** ---------------------------------------------------------------------------
 * ================================= main pages ===================================
 *-----------------------------------------------------------------------------**/
router.get('/', (req, res, next) => {
  res.send('hello world api')
})

/** ---------------------------------------------------------------------------
 * ================================= Routes ===================================
 *-----------------------------------------------------------------------------**/
/**
 * @desc 路由查询接口，查询路由是否有效
 * */
router.get('/router', _router.getRouter)

/**
 * @desc 查询路由的数据
 * */
router.get('/getRouterList', _router.getRouterList)

/**
 * @method POST
 * @desc 添加路由操作
 * */
router.post('/addRouter', _router.addRouter)

/**
 * @desc 删除路由操作
 * */
router.post('/deleteRouter', _router.deleteRouter)

/** ---------------------------------------------------------------------------
 * ================================= article ===================================
 *-----------------------------------------------------------------------------**/
/**
 * @desc 查询文章的数据
 * */
router.get('/getArticleList', _article.getArticleList)

/**
 * @desc 发表新的文章 ＋编辑文章
 * */
router.post('/publishArticle', _article.publishArticle)

/**
 * @desc 拉取单篇文章
 * */
router.get('/getArticle', _article.getArticle)

/**
 * @desc 删除文章
 * @desc 支持数组形式
 * @todo no dev
 * */
router.post('/deletesArticle', _article.deleteArticle)

/** ---------------------------------------------------------------------------
 * ================================= user ===================================
 *-----------------------------------------------------------------------------**/
/**
 * @desc 获取用户身份信息
 * */
router.get('/getUser', _user.getUser)

/** ---------------------------------------------------------------------------
 * ================================= public ===================================
 *-----------------------------------------------------------------------------**/

/**
 * @desc 用户登录
 * */
router.post('/login', _public.login)

/**
 * @desc 注销登录 路由
 * */
router.post('/logout', _public.logout)

/**
 * @desc 注册账号
 * */
router.post('/register', _public.register)

/*******************************************************************
 * @desc novel 模块
 * */
router.get('/novel/getNovel', _novel.getNovel)// 起点搜索小说
router.post('/novel/customizedNovel', _novel.customizedNovel)// 定制化
router.get('/novel/getNovelList', _novel.getNovelList)// 小说翻页
router.post('/novel/clearNovel', _novel.clearNovel)// 清空任务栈
router.get('/novel/novelTesting', _novel.novelTesting)// testing

router.get('/novel/download', _novel.download)// 下载小说

export {router}
