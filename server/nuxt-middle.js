/***********************
 * @name JS
 * @author Jo.gel
 * @date 9/12/2018
 * @desc nuxt自带命令启动的时候，支持http
 * @desc /test 都会经过这个中间器件
 ***********************/
const express = require('express')
const app = express()
const router = express.Router()
router.get('/test', function (req, res, next) {
  // console.info('/test 都会经过我~');
  res.json({test: 'hello test world'})
})
app.use(router)
module.exports = app
