/***********************
 * @name JS
 * @author Jo.gel
 * @date 2017/11/18
 * @desc 常见操作函数
 ***********************/

/**
 * @desc mongodb 操作失败函数
 * @res res
 * @err err
 * @errorCode 错误代码
 * */
function _dbError (res, err, errorCode) {
  return res.json({
    msg: err || '服务端错误',
    data: [],
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
function _flipPage (res, data, errorCode, msg, {totals, pages, currentPage}) {
  return res.json({
    errorCode: errorCode || 0,
    data: data || [],
    msg: msg || '操作成功',
    totals,
    pages,
    currentPage
  })
}

export {_isAuth, _dbError, _flipPage}
