/* eslint-disable no-unused-vars */
/***********************
 * @name JS
 * @author Jo.gel
 * @date 2018/4/20
 ***********************/
const {RouterModel} = require('../model/model')
const {_dbError, _dbSuccess, _queryRouter} = require('../functions/functions')
const logger = require('tracer').console() // console追踪库
/**
 * @desc 每次进入 /xx 非页面路由都会调用这个接口，也就是后端路由
 * @desc 这时，使用router 的中间器件，函数来判断是否存在,
 * //todo 路由请求和mongodb 处理函数区分开
 * @desc 路由查询接口，查询路由是否有效
 * **/
const _router = {
  /**
   * @desc 判断路由是否有效
   * @todo
   * */
  getRouter: async (req, res, next) => {
    let router = await RouterModel.find({'name': req.query.router}).exec()
    if (router.length === 0) {
      req.session.routerLock = true // 路由锁定,auth.js ，直接error({报错处理})
      return _dbError(res, '404用户')
    } else {
      req.session.routerLock = false
      return _dbSuccess(res)
    }
  },
  /**
   * @desc 查询路由数据
   * @todo 增加模糊查询，匹配 name status:{normal,keep,ban},type:{official,brand,user}
   * */
  getRouterList: async (req, res, next) => {
    let data = req.query.name ? ({name: req.query.name}) : {}
    let findRouter = await RouterModel.find(data).exec()
    if (findRouter.length === 0) {
      return res.json({errorCode: 1, data: [], msg: '尚无路由数据'})
    } else {
      return res.json({errorCode: 0, data: findRouter, msg: 'success'})
    }
  },
  /**
   * @desc 添加路由
   * */
  addRouter: async (req, res, next) => {
    let findRouter = await RouterModel.find({name: req.body.name})
    // 1、已存在
    if (findRouter.length > 0) {
      return _dbError(res, '已存在', null, 2)
    } else {
      // 2、如果没有存在，则允许继续添加,插入数据
      let saveRouter = new RouterModel(req.body, false)
      saveRouter.save(function (err, resDB) {
        if (err) {
          return _dbError(res, err, null, 4)
        } else {
          return _dbSuccess(res)
        }
      })
    }
  },
  /**
   * @desc 删除操作
   * */
  deleteRouter: async (req, res, next) => {
    let data = req.body
    if (data.length === 0) {
      return _dbError(res, '路由名称不允许为空', 2500)
    } else {
      // 传递正常
      // 1 先查询存在该路由名称
      if (_queryRouter(data)) {
        // 开始删除操作
        let delRouter = await RouterModel.remove(data).exec()
        if (delRouter.ok) {
          return _dbError(res)
        } else {
          return _dbError(res, '删除失败', 2500)
        }
      } else {
        // 2、否则，不存在路由
        return res.json({
          errorCode: 1,
          msg: 'error 不存在该路由，无法删除路由'
        })
      }
    }
  }
}

module.exports = _router
