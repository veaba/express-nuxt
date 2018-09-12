/***********************
 * @name JS
 * @author Jo.gel
 * @date 2018/4/20
 ***********************/
const {UsersModel} = require('../model/model')
const {_dbError, _dbSuccess, _encryptedPWD} = require('../functions/functions')
const _public = {
  /**
   * @desc 登录
   * */
  login: async (req, res, next) => {
    let findUser = await UsersModel.find({username: req.body.username}).exec()
    let checkPwd = findUser[0] ? findUser[0].password : ''
    let inputPwd = await _encryptedPWD(req.body.password)
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
        return _dbSuccess(res, '登录成功')
      } else {
        return _dbError(res, '登录失败，密码错误')
      }
    }
  },
  /**
   * @desc logout 退出
   * @todo 后续可能会记录的一些行为来追踪
   * */
  logout: async (req, res, next) => {
    req.session.isAuth = null
    return _dbSuccess(res, '退出成功')
  },
  /**
   * @desc 用户注册
   * @todo 2018年4月20日14:34:41 在系统尚未测试稳定之前，不会开放该注册功能
   * */
  register: async (req, res, next) => {
    if (req.session.isAuth) {
      return _dbSuccess(res, '你可以注册啦！(该功能尚未开放)')
    } else {
      return _dbError(res, '你丫没人权！(该功能尚未开放)')
    }
  }

}
module.exports = _public
