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
const socket = io('http://' + process.env.HOST + ':' + (process.env.PORT * 1.0 + 1))
// if (process.server) {
//   console.info('你是服务器端吗?')
// } else {
//   console.info(process.env)
// }
Vue.use(socket)
