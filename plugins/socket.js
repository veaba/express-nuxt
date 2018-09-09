/***********************
 * @name JS
 * @author Jo.gel
 * @date 2017/11/12
 * @desc 调用socket
 * @desc 端口配置在nuxt.config.js
 * @desc 由于socket 的端口不能和nuxt服务器化的端口一致，为此，此处的做法是在http的端口上加1
 ***********************/
import Vue from 'vue'
import io from 'socket.io-client'
import config from '../nuxt.config'
console.info(config.dev);
const socket = io('http://' + '127.0.0.1' + ':' + (444), {
  reconnectionAttempts: 10// 自动重连次数
})
socket.connect((res) => {
  console.info(res);
})
Vue.use(socket)
Vue.prototype.$socket = socket
export default socket
