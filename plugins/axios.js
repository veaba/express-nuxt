import Vue from 'vue'
import axios from 'axios'
import { Notice } from 'iview'
/**
 * @desc 重定向登录页面
 * */
// function redirectLogin () {
//   let path = Vue.prototype.$nuxt._router.history.fullPath || ''
//   location.href = '/login?ref=' + path
// }

/**
* @desc req 拦截器
* */
axios.interceptors.request.use(req => {
  // console.info('axios request 拦截器')
  return req
}, err => {
  return Promise.reject(err)
})
/**
 * @desc res 拦截器 Axios 和socket没什么卵关系~~
 * */
axios.interceptors.response.use(res => {
  if (res && res.data) {
    if (res.data.errorCode === 0 || res.data.errorCode === 1) {
      return res.data
    } else if (res.data.errorCode === 2403) {
      Notice.error({
        title: '你有一条错误警告消息',
        desc: res.data.msg || '未经授权'
      })
    } else {
      // 4003 等状态则跳回login 页面
      // redirectLogin()
      return Promise.reject(res.data)
    }
  }
  return res
}, error => {
  // console.info(error)
  // // todo 有问题
  // if (error && error.res && error.res.data && error.res.data.errorCode) {
  //   console.info(error)
  //   if (error.res.data.errorCode === 403) {
  //     redirectLogin()
  //   }
  // }
  // 错误信息扶正，后续在请求时，不需要catch
  return Promise.resolve(error.response)
})
Vue.prototype.$ajax = axios

// 暴露出去给vuex 使用
export default axios

// export default (ctx) => {
//   console.info(ctx)
// }
