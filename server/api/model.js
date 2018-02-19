/* eslint-disable no-undef */
/**
 * @desc user api Mongoose Model
 * @GET 使用req.params 来去到get过来的参数
 * @POST 使用req
 * @desc 用户数据模式
 * @desc collection users
 * */
import mongoose from 'mongoose'
let Schema = mongoose.Schema

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
  id: Number, // 文章id
  comments_status: String, // 评论的开关状态
  post_author: String, // 文章的id
  post_date: String, // 发表的时间
  post_content: String, // 文章内容
  post_title: String, // 文章标题
  post_password: String, // 文章如果加密的话
  post_modified: String, // 修改的时间
  url: String // 生成的url 地址
})

/***********************************************
 * @desc 构建表模型，model(CollectionName,Model)
 * **********************************************/
let UsersModel = mongoose.model('users', usersSchema)
let RouterModel = mongoose.model('routers', routerSchema)
let ArticleModel = mongoose.model('articles', articleSchema)
export {UsersModel, RouterModel, ArticleModel}
