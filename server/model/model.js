/* eslint-disable no-undef */
/**
 * @desc user api Mongoose Model
 * @GET 使用req.params 来去到get过来的参数
 * @POST 使用req
 * @desc 用户数据模式
 * @desc collection users
 * */
const mongoose = require('mongoose')
const Schema = mongoose.Schema

/*************************************
 * @desc 声明用户schema
 * @desc 支持一下内置类型
 * @String
 * @Number
 * @Boolean
 * @Array
 * @Buffer
 * @Date
 * @Object / OID
 * @Mixed
 * */
let usersSchema = new Schema({
  id: String,
  username: String, // 用户名
  password: String, // 密码
  pwd: String, // 密码
  pass: String, // 密码
  nick: String, // 昵称
  email: String, // email
  phone: String, // phone
  avatar: String, // 头像
  github: String, // github
  weibo: String, // 微博
  Bio: String, // 简介
  country: String // 所属国家的图标
})

/***********************************************
 * @desc 路由表管理
 * */
let routerSchema = new Schema({
  id: String,
  name: String,
  status: String,
  type: String
})

/***********************************************
 * @desc 文章
 * */
let articleSchema = new Schema({
  comments_status: String, // 评论的开关状态 open closed
  post_author: String, // 作者
  post_date: String, // 发表的时间
  post_content: String, // 文章内容
  post_title: String, // 文章标题
  post_abstract: String, // 文章摘要，默认摘录50字
  post_password: String, // 文章如果加密的话
  post_modified: String, // 修改的时间
  post_url: String, // 生成的url 地址
  copyright_type: String, // original 原创、reprint 转载
  reprint_url: String, // 如果是转载的话，前端就有一个转载的url
  original_date: String, // 原始发表的时间，
  editor_number: Number // 被编辑过的次数
})

/**
 * @desc 小说Novel
 * */
let novelSchema = new Schema({
  name: String, // 小说名称
  author: String, // 作者
  title: String, // 章节标题
  uuid: Number, // 章节序号，起点获取，真正的章节序号，放置有卷数干扰，为唯一id
  real: String, // 卷名
  qiDianUrl: '', // 起点单章的url地址，包含vip章节和免费章节的url组装
  updateTime: String, // 更新时间
  qiDianId: Number, // 起点章节的ID
  isVip: Number, // 0 为免费 1为VIP
  preview: String, // 内容预览200字以下，起点获取
  content: String, // 内容
  length: Number, // 字数
  domain: String, // 所在主机,
  url: String, // 所在章节的url，半截，爬取的盗版网站
  end: Boolean, // 是否完结，如果同本小说，存在该状态 true，则说明小说完结，默认false
  timeout: Boolean, // 超时爬取true,default false
  spiderTime: String, // 爬虫更新的时间
  error: Number, // 异常为1、正常为0 由于爬取的小说网站和【重名-尚未处理该异常】、命名错误、符号等原因导致无法查找产生异常
  type: String, // default 起点、customer、定制化
  index: Number // 伪装uuid
})
let novelErrorUrlSchema = new Schema({
  url: String, // 记录url
  book: String// 记录书名
})
/***********************************************
 * @desc 构建表模型，model(CollectionName,Model)
 * **********************************************/
const UsersModel = mongoose.model('users', usersSchema)
const RouterModel = mongoose.model('routers', routerSchema)
const ArticleModel = mongoose.model('articles', articleSchema)
const NovelModel = mongoose.model('novels', novelSchema)
const NovelBadUrlModel = mongoose.model('bad.urls', novelErrorUrlSchema)
module.exports = {
  UsersModel, RouterModel, ArticleModel, NovelModel, NovelBadUrlModel
}
