import Vue from 'vue'
import axios from 'axios'

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
  // console.info(res)
  if (res && res.data) {
    return res.data
  }
  return {errorCode: -1, data: null, msg: 'service error'}
}, error => {
  // 错误信息扶正，后续在请求时，不需要catch
  return Promise.resolve(error.response)
})
Vue.prototype.$ajax = axios

// 暴露出去给vuex 使用
export default axios
