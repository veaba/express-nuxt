/* eslint-disable handle-callback-err */
/***********************
 * @name JS
 * @author Jo.gel
 * @date 2017/11/18
 * @desc 常见操作函数
 ***********************/
import cryPto from 'crypto'
import {RouterModel} from '../model/model' // node 中的加密模块
const logger = require('tracer').console() // console追踪库

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
    pageCurrent: Number(pageCurrent)
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

/**
 * @desc webSocket连接函数，io.on 连接的回调函数
 * */
async function _webSocket (socket) {
  // emit 向所有连接的客户端发送消息

  // 收到消息
  socket.on('receive', (data) => {
    socket.emit('receive1', {lala: 'lalallala'})
    logger.error(data)
  })
  // novel 向前端通信
  console.info('novel 向前端通信')
  logger.warn('\n~~~~Websocket已连接~~~~\n')
}
/**
 * @desc 下载小说函数，返回结果
 * */
async function _download (res, msg, data, errorCode) {
  console.time('发送到前端消耗时间')
  // eslint-disable-next-line no-irregular-whitespace
  res.send(data.replace(/　　/g, '\n\n　　'))
  console.timeEnd('发送到前端消耗时间')
}
export {_isAuth, _dbError, _dbSuccess, _flipPage, _encryptedPWD, _queryRouter, _webSocket, _download}
