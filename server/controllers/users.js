/***********************
 * @name JS
 * @author Jo.gel
 * @date 2018/4/20
 ***********************/
const {_dbError, _dbSuccess} = require('../functions/functions')
const _user = {
  getUser: async (req, res, next) => {
    // 如果session 存在则判断用户在登录状态
    if (req.session && req.session.isAuth) {
      return _dbSuccess(res, null, req.session.userInfo)
    } else {
      _dbError(res, '你尚未登录，无权限获取用户信息', null, 2403)
    }
  }
}
module.exports = _user
