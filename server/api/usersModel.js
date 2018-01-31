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
 * @desc 构建表模型，model(CollectionName,Model)
 * **********************************************/
let usersModel = mongoose.model('users', usersSchema)

/**
 * @desc 初始化用户数据
 * */
// let initUsers = {
//   username: '', // 用户名
//   password: '', // 密码
//   nick: '', // 昵称
//   email: '', // email
//   phone: '', // phone
//   avatar: '', // 头像
//   github: '', // github
//   weibo: '', // 微博
//   Bio: '', // 简介
//   country: '', // 所属国家的图标
//   language: '' // 语言
// }
export default usersModel

// module.exports = {usersModel}
