import Vue from 'vue'
import axios from 'axios'
/**
 * @desc 重定向登录页面
 * */
// function redirectLogin () {
//   console.info(3322)
//   // console.info(location)
//   location.href = '/login'
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
 * @desc res 拦截器
 * */
axios.interceptors.response.use(res => {
  if (res && res.data) {
    if (res.data.errorCode === 0 || res.data.errorCode === 1) {
      return res.data
    } else {
      console.info(22222)
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
