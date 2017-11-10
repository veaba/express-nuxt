/***********************
 * @name JS
 * @author Jo.gel
 * @date 2017/11/10
 ***********************/
/*************************
 * @desc 授权方式访问数据，需要在mongodb中创建数据库并设置默认管理员账号密码开启授权模式
 * ************************/
// function authMongodb () {
//   return `${config.scheme}://${config.user}:${config.pwd}@${config.host}:${config.port}/${config.database}`
// }
//
// /**
//  * @desc 连接数据库
//  * **/
// mongoose.connect(authMongodb(), { server: {socketOptions: {keepAlive: 1}} }) // 连接
// let db = mongoose.connection
//
// /**
//  * @desc 连接成功
//  * */
// db.openSet('connected', function () {
//   console.info('------------ 连接成功 ------------')
//   console.info('连接参数：' + authMongodb())
// })
//
// /**
//  * @desc 断开连接
//  * */
// db.on('disconnected', function () {
//   console.info('*********** 断开连接 ***********')
// })
//
// /**
//  * @desc 连接异常
//  * */
// db.on('error', function (err) {
//   console.info('连接失败：' + err)
// })