/**
 * @向外提供Router Express路由，es5 require方式
 * */
import _novel from '../controllers/novels'
const _article = require('../controllers/articles') // 文章操作函数
const _router = require('../controllers/routers') // 路由相关操作函数
const _public = require('../controllers/publics') // 公开相关操作函数
const _user = require('../controllers/users')
// const _novel = require('../controllers/novels')
const {Router} = require('express') // 小说下载操作函数，有问题
const router = Router()

/** ---------------------------------------------------------------------------
 * ================================= Routes ===================================
 *-----------------------------------------------------------------------------**/
router.get('/getRouter', _router.getRouter)// 路由查询接口，查询路由是否有效
router.get('/getRouterList', _router.getRouterList)// 查询路由的数据
router.post('/addRouter', _router.addRouter)// 添加路由操作
router.post('/deleteRouter', _router.deleteRouter)// 删除路由操作

/** ---------------------------------------------------------------------------
 * ================================= article ===================================
 *-----------------------------------------------------------------------------**/
router.get('/getArticleList', _article.getArticleList)// 查询文章的数据
router.post('/publishArticle', _article.publishArticle)// 发表新的文章 ＋编辑文章
router.get('/getArticle', _article.getArticle)// 拉取单篇文章

/**
 * @desc 删除文章
 * @desc 支持数组形式
 * @todo no dev
 * */
router.post('/deletesArticle', _article.deleteArticle)//

/** ---------------------------------------------------------------------------
 * ================================= user ===================================
 *-----------------------------------------------------------------------------**/
router.get('/getUser', _user.getUser)// 获取用户身份信息

/** ---------------------------------------------------------------------------
 * ================================= public ===================================
 *-----------------------------------------------------------------------------**/
router.post('/login', _public.login)// 用户登录
router.post('/logout', _public.logout)// 注销登录 路由
router.post('/register', _public.register)// 注册账号

/*******************************************************************
 * @desc novel 模块
 * */
router.post('/novel/customizedNovel', _novel.customizedNovel)// 定制化
router.get('/novel/getNovelList', _novel.getNovelList)// 小说翻页
router.post('/novel/clearNovel', _novel.clearNovel)// 清空任务栈
router.get('/novel/novelTesting', _novel.novelTesting)// testing
router.get('/novel/download', _novel.download)// 下载小说
module.exports = router
