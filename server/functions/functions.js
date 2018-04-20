/***********************
 * @name JS
 * @author Jo.gel
 * @date 2017/11/18
 * @desc 常见操作函数
 ***********************/
import cryPto from 'crypto'
import {RouterModel} from '../model/model' // node 中的加密模块

/**
 * @desc mongodb 操作成功函数,返回到前端
 * @res res
 * @err err
 * @errorCode 错误代码
 * */
async function _dbSuccess (res, msg, data, errorCode) {
  return res.json({
    msg: msg || '操作成功',
    data: data || [],
    errorCode: errorCode || 0
  })
}
/**
 * @desc mongodb 操作失败函数
 * @res res
 * @err err
 * @errorCode 错误代码
 * */
function _dbError (res, msg, data, errorCode) {
  return res.json({
    msg: msg || '服务端错误',
    data: data || [],
    errorCode: errorCode || 1
  })
}
/**
 * @desc 判断拉去API的请求是否授权，否则
 * @res  {Object}
 * @session {Boolean}
 * */
function _isAuth (res, session) {
  if (session) {
    return true
  } else {
    return _dbError(res, '尚未登录无法获取', 4003)
  }
}

/**
 * @desc mongodb 分页函数
 * @res res
 * @err err
 * @errorCode
 * @{total总条数,pageTotal总页数,pageNumber当前页数}
 * */
async function _flipPage (res, data, errorCode, msg, {totals, pages, pageCurrent}) {
  return res.json({
    errorCode: errorCode || 0,
    data: data || [],
    msg: msg || '操作成功',
    totals: totals,
    pages: pages,
    pageCurrent: pageCurrent
  })
}

/**
 * @desc 密码加密模块
 * @desc 加盐'beike'，十六进制,加密算法sha256
 * */
function _encryptedPWD (password) {
  return cryPto.createHmac('sha256', password)
    .update('beike')
    .digest('hex')
}

/**
 * @desc 查询路由名称
 * */
async function _queryRouter (req, res, next) {
  let findRouter = await RouterModel.find(req)
  return findRouter
}
export {_isAuth, _dbError, _dbSuccess, _flipPage, _encryptedPWD, _queryRouter}
