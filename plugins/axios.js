import Vue from 'vue'
import axios from 'axios'

/**
* @desc req 拦截器
* */

/**
 * @desc res 拦截器
 * */
axios.interceptors.response.use(response => {
  return response.data
}, error => {
  // 错误信息扶正，后续在请求时，不需要catch
  return Promise.resolve(error.response)
})
Vue.prototype.$ajax = axios
