/**
 * @desc user api Mongoose Model
 * @GET 使用req.params 来去到get过来的参数
 * @POST 使用req
 * */
import mongoose from 'mongoose'
let Schema = mongoose.Schema

/**
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
let UserSchema = new Schema({
  user: String, // 管理员用户名称
  pwd: String, // 管理员密码
  nick: String, // 昵称
  email: String, // email
  phone: String, // phone
  avatar: String, // 头像
  github: String, // github
  weibo: String, // 微博
  Bio: String, // 简介
  country: String, // 所属国家的图标
  language: String // 语言
})
let userModel = mongoose.model('admin', UserSchema)
export default userModel
