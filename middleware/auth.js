/***********************
 * @name JS
 * @author Jo.gel
 * @date 2017/11/19
 * @desc 授权中心
 ***********************/
/***
 * @desc 通过nuxt.render函数，把nuxt.js 作为node.js 服务端的中间件
 * @param store store
 * @param redirect function 重定向
 * @param error function
 * @param route 路由
 * @param req request
 * @param res response
 * @desc 如果直接在组件中this.$router.push('/')，将不会有req、res产生
 * @desc 中间件将在每个路由改变时被调用,
 * @desc 中间件允许您定义一个自定义函数运行在一个页面或一组页面渲染之前。
 * @desc 一个中间件接收 context 作为第一个参数：
 * @desc 运行流程
 * 1 nuxt.config,js
 * 2 匹配布局
 * 3 匹配页面
 */
export default function ({store, redirect, error, route, req, res}) {
  if (error) {
    console.info(error)
    return
  }
  console.info('auth.js 被调用')
  // 判断路由锁定，则直接跳到错误页 todo 可能需要考虑和login 的兼容情况
  if (req && req.session) {
    if (req.session.routerLock) {
      error({
        message: 'You are not connected 抱歉，没有找到该用户~~~~~~~', statusCode: 404
      })
      return false
    }
  }
  if (!req) {
    if (!store.state.isAuth) {
      return redirect('/login')
    }
  } else {
    if (!req.session.isAuth) {
      // 如果没有登录状态则跳转到login页面
      let referer = req.url
      if (referer && referer !== '/login') {
        //   Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client
        // req.session.referer = referer
      }
      return redirect('/login')
    }
  }
}
