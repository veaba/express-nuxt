/***********************
 * @name JS
 * @author Jo.gel
 * @date 2017/11/12
 * @desc 调用socket
 * @desc 端口配置在nuxt.config.js
 * @desc 由于socket 的端口不能和nuxt服务器化的端口一致，为此，此处的做法是在http的端口上加
 * @role1  本地使用127.0.0.1/localhost
 * @role2  server 使用域名
 ***********************/
import Vue from 'vue'
import io from 'socket.io-client'
import config from '../nuxt.config'
const host = (process.env.NODE_RENDER === 'server' || process.env.NODE_RENDER === undefined) ? 'www.admingod.com' : '127.0.0.1'
const scheme = (process.env.NODE_RENDER === 'server' || process.env.NODE_RENDER === undefined) ? 'https://' : 'http://'
const socket = io(scheme + host + ':' + (config.env.PORT + 1.0 || 444), {
  reconnectionAttempts: 10// 自动重连次数
})
Vue.use(socket)
Vue.prototype.$socket = socket
export default socket
