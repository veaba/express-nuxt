/***********************
 * @name JS
 * @author Jo.gel
 * @date 2017/11/19
 * @desc 授权中心
 ***********************/
/***
 * @desc 通过nuxt.render函数，把nuxt.js 作为node.js 服务端的中间件
 * @param store store
 * @param redirect function
 * @param error function
 * @param route 路由
 * @param req request
 * @param res response
 * @desc 如果直接在组件中this.$router.push('/')，将不会有req、res产生
 */
export default function ({store, redirect, error, route, req, res}) {
  // console.info('~~~~~ auth auth auth ~~~~~')
  // console.info('-----------------------------------------')
  if (!req) {
    // console.info('no req')
    // console.info(store.state)
    if (!store.state.isAuth) {
      // console.info('store store state')
      return redirect('/login')
    }
  } else {
    // console.info(req.session.isAuth)
    if (!req.session.isAuth) {
      // 如果没有登录状态则跳转到login页面
      return redirect('/login')
    }
  }
}
