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
  // console.info('axios response 拦截器')
  // console.info(res)
  // console.info(res)
  return res.data
}, error => {
  // 错误信息扶正，后续在请求时，不需要catch
  return Promise.resolve(error.response)
})
Vue.prototype.$ajax = axios
