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
 */
export default function ({store, redirect, error, route, req, res}) {
  console.info(req)
  // TODO 此处条件??
  if (!req) {
    if (!store.state.isAuth) {
      // error({
      //   message: 'You are not connected', statusCode: 403
      // })
      return redirect('/login')
    }
  } else {
    if (!req.session.isAuth) {
      // 如果没有登录状态则跳转到login页面
      let referer = req.url
      if (referer && referer !== '/login') {
        req.session.referer = referer
      }
      //
      // error({
      //   message: 'You are not connected', statusCode: 403
      // })
      return redirect('/login')
    }
  }
}
