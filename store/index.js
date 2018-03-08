/***********************
 * @name JS
 * @author Jo.gel
 * @date 2017/11/19
 * @desc 用户基本信息存储到localStorage
 ***********************/

import Vue from 'vue'
import Vuex from 'vuex'
import axios from '../plugins/axios'

Vue.use(Vuex)

// window.fetch()的Polyfill,为了让fetch()函数在所有浏览器可用，引入了whatwg-fetch
require('whatwg-fetch')

const store = () => new Vuex.Store({
  // 单一状态树。全局isAuth
  state: {
    isAuth: null, // 通行状态
    counter: 0,
    userInfo: {
      id: null,
      username: null,
      nick: null,
      email: null
    }, // 存储用户基础信息
    Referer: null, // 存储来源页面地址
    routerLock: null // 锁定路由
  },
  // 变化。更改store的唯一方法是提交mutations，每个mutations都有一个字符串的事件类型和一个回调函数
  // 此时user为store.commit传入额外参数，即mutation的载荷（payload）
  mutations: {
    // SET_USER mutation 会把当前已登录对象注入到state.isAuth中
    SET_AUTH (state, isAuth) {
      state.isAuth = isAuth
    },
    increment (state) {
      state.counter++
    },
    // 登录成功之后，信息传递到vuex 的 $store.state.
    USER_INFO (state, userInfo) {
      state.userInfo = userInfo
    },
    // 登录之前的引用页面
    REFERER (state, Referer) {
      state.Referer = Referer
    },
    // 锁定路由
    ROUTER_LOCK (state, ROUTERLOCK) {
      state.routerLock = ROUTERLOCK
    }
  },
  // action 提交的是mutation，不是直接更改状态
  // 可以包含任意异步操作
  actions: {
    /**
     * @desc 获取用户个人信息
     * @desc 登录时候，登录信息储存到 localStorage
     * */
    getUserInfoAPI ({commit}, info) {
      axios.get('/api/user')
        .then(res => {
          if (res.errorCode === 0) {
            localStorage.userInfo = JSON.stringify(res.data)
            commit('USER_INFO', res.data)
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    /**
     * @desc 此方法可以让服务端将一些数据传给客户端
     * */
    nuxtServerInit ({commit}, {req}) {
      // 1未授权之前处理referer的路由跳转
      let referer = req.session.referer
      console.info('未授权之前处理referer的路由跳转' + req.session.routerLock)
      if (req.session.routerLock) {
        commit('ROUTER_LOCK', true)
      } else {
        commit('ROUTER_LOCK', false)
      }
      if (referer && referer !== '/login') {
        commit('REFERER', referer)
      } else {
        commit('REFERER', '/')
      }
    }
  },
  /**
   * @desc 相当于计算属性,缺点是，并不能及时更新数据。。。实际需要检测数据的变化，有没有登录
   * */
  getters: {}
})
export default store
