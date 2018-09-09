/**
 * @desc nuxt 配置文件
 * @Port 端口配置 env.PORT
 * */
// 1 部署部分，由于https://veaba.github.io/express-nuxt/ 为此需要一个基础的路径
// 无法解构
// const forceSSL = require('express-force-ssl')
const routerBase = process.env.DEPLOY_ENV === 'GH_PAGES' ? '/express-nuxt/' : ''
console.info('*************');
console.info('^^^^^^^^^^^^^');
module.exports = {
  router: {
    base: routerBase
  },
  head: {
    title: 'beike.io',
    meta: [
      {charset: 'utf-8'},
      {name: 'viewport', content: 'width=device-width, initial-scale=1'},
      {hid: 'description', name: 'description', content: 'Nuxt.js project'}
    ],
    link: [
      {rel: 'icon', type: 'image/x-icon', href: '/favicon.ico'}
    ]
  },
  /*
  ** Global CSS
  */
  css: ['~/assets/css/main.css',
    {
      src: '~assets/scss/main.scss', lang: 'scss'
    },
    {
      src: '~assets/scss/common.scss', lang: 'scss'// 指定scss 文件而非sass，然而使用scss产生大量的map无效字符，后期还是需要引用scss
    },
    {
      src: '~assets/scss/iViewFix.scss', lang: 'scss'// 修复iView缺陷
    },
    {
      src: '~assets/scss/markdown.scss', lang: 'scss'// markdown 渲染样式
    }
  ],
  /*
  ** Add axios globally
  */
  build: {
    vendor: ['axios'],
    /*
    ** Run ESLINT on save
    */
    extend (config, { isDev, isClient }) {
      if (isDev && isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  },
  // dev 属性的值会被 nuxt 命令 覆盖 https://zh.nuxtjs.org/api/configuration-dev#dev-%E5%B1%9E%E6%80%A7%E9%85%8D%E7%BD%AE
  // 当使用 nuxt 命令时，dev 会被强制设置成 true
  // 当使用 nuxt build， nuxt start 或 nuxt generate 命令时，dev 会被强制设置成 false
  dev: (process.env.NODE_ENV !== 'production'),
  env: {
    baseUrl: process.env.BASE_URL || 'http://localhost:443',
    HOST: '0.0.0.0',
    PORT: '443'
  },
  // axios 请求组件、iview ui 组件 、socket webSocket组件、 mavon-editor 编辑器markdown 组件'~plugins/axios',
  // 插件引入axios，导致报错 context.isClient has been deprecated, please use process.client instead
  // context.isServer has been deprecated, please use process.client instead
  plugins: ['~plugins/highlight-plugins', '~plugins/iview', '~plugins/socket', {src: '~plugins/mavon-editor', ssr: false}],
  // 服务器中间器件,因为使用backpack导致重复，所以这地方需要处理下
  // 发现是字符串，尝试require解析
  // If middleware is String Nuxt.js will
  // try to automatically resolve and require it.
  // 使用本文件下的serverMiddleware，始终会启动http服务，WTF?
  serverMiddleware: [
    // '~/server/index.js'
  ]
  // modules: ['bootstrap-vue/nuxt'],暂时不调用bootstrap
  // 路由跳转调用中间鉴权文件
}
