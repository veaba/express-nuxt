/***********************
 * @name JS
 * @author Jo.gel
 * @date 2017/11/7
 * @desc 向api/index.js 暴露配置文件
 ***********************/

/**
 * @desc db config
 * */
module.exports.config = {
  base: 'mongodb://127.0.0.1', // 普通不授权模式链接mongodb
  domain: 'vsorg.com', // 主域名
  port: '27017',
  host: '127.0.0.1',
  scheme: 'mongodb', // 协议
  database: 'beike', // 数据库名称
  user: 'admin', // 管理员用户名称
  pwd: 'admin'// 管理员密码
}

/**
 * @desc InitAdmin
 * */
module.exports.InitAdmin = {
  user: 'admin', // 管理员用户名称
  pwd: 'admin', // 管理员密码
  nick: 'admin', // 昵称
  email: 'admin@vsorg.com', // email
  phone: '', // phone
  avatar: '', // 头像
  github: '', // github
  weibo: '', // 微博
  Bio: '', // 简介
  country: '', // 所属国家的图标
  language: '' // 语言
}
