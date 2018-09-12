import Vue from 'vue'
import axios from 'axios'
import { Notice } from 'iview'

if (process.browser) {
  // console.info('浏览器!');
  axios.defaults.baseURL = '/'
} else {
  // console.info('不是浏览器');
  axios.defaults.baseURL = 'http://localhost/api'
}

/**
* @desc req 拦截器
* */
axios.interceptors.request.use(req => {
  return req
}, err => {
  return Promise.reject(err.request)
})
/**
 * @desc res 拦截器 axios
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
      return Promise.reject(res.data)
    }
  }
  return res
}, error => {
  // 错误信息扶正，后续在请求时，不需要catch
  return Promise.resolve(error.response)
})
Vue.prototype.$ajax = axios

// 暴露出去给vuex 使用
export default axios
