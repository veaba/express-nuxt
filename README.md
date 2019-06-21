# 基于 express 的 nuxt 服务端渲染网站

## 安装

```json
{
    "nuxt-dev": "nuxt",//官方 Start ExpressJS serverNew in development with Nuxt.js in dev mode (hot reloading). Listen on http://localhost:3000.
    "nuxt-build": "nuxt build",//官方 Build the nuxt.js web application for production.
    "nuxt-start": "nuxt build && nuxt start",//官方 Start ExpressJS serverNew in production.
    "backpack-dev": "backpack debug dev",//开发模式下，使用此命令，让实现热重载
    "backpack-build": "nuxt build && backpack build",
    "backpack-start": "cross-env NODE_ENV=production node build/main.js"
}
```
## HTTP2
	郁闷！HTTP2自带了HTTPS了，所以很简单。
	
- 警惕 spdy会导致页面刷新的时候，服务器直接炸掉。

![访问http2Error](/static/img/spdy-error.png "访问http2Error")

```js
const express = require('express')
const http2 =require('http2')
const spdy = require('spdy')
const fs = require('fs')
const path = require('path')
const app = express()
const http2Options = {
  key: fs.readFileSync(path.join(__dirname, './ssl/key.pem')),
  cert: fs.readFileSync(path.join(__dirname, './ssl/cert.pem')),
  spdy:{
      'x-forwarded-for': true,
  }
}

const http2Server = spdy.createServer(http2Options,app)
http2Server.listen(8080)

app.get('/',function (req,res,next) {
    res.send('<h1>hello world HTTP2</h1>')
})

```
## HTTPS/SSL/TSL
- 如果使用`nuxt-dev`、`nuxt-start`请求一次，都会让中间器件重新链接数据库，这显然不太对。能否让稳定的express 链接？
- 提示，经过多次验证，发现nuxt内置的服务端无法被中间器件应用他的路由，除非nuxt作为express的中间器件被应用，这方式和启动`npm run server`一样
- 提示，`serverMiddleware`不得含有空字符串。
	`nuxt.config.js`的 `serverMiddleware`比如是含有中间器件字符串，不得存在空字符串情况，可以使空数组，但元素不能为空!否则无法调用 nuxt page里面的全部路由
- 提示，`vmware-hostd.exe` 会占用443端口

	如果本机安装了`VMware` 将可能在某个时候被 `vmware-hostd.exe` 占用 443端口，这时候https 服务将无法启动，需要注意下，9月11日我就搞了一天，后来 cmd 下 `netsate -ano` 查看了端口并关闭了对应的进程才得以成功。

- 全站开启了`HTTPS`访问

	可喜可贺，折腾了十几个小时，这次的升级是心满意足了。并干掉了两个讨厌的警告，警告我半年了！！

	这是因为在 plugins: ['~plugins/axios']的原因，早期开发的版本引起！一直没注意到！！
```text
context.isServer has been deprecated, please use process.server instead.
context.isClient has been deprecated, please use process.client instead.
```

`by@veaba ——2018年9月10日03:08:43` 


- 访问http将会301重定向到https上去
![访问http将会301重定向到https上去](/static/img/https.jpg "访问http将会301重定向到https上去")

- 依赖插件如下:
```json
{
	"express-force-ssl": "^0.3.2"
}
```
- 主要代码
```js
	// 1.不用官方的在nuxt.config.js文件配置，不管怎么样都会启动http服务，搞了半天，没看懂。后续再看
	module.exports={
        serverMiddleware: [
                '~/server/index.js'
         ]
	}
	
	// 2.入口文件，依赖了babel-register，让它/server/index.js 作为一个入口文件，支持导入es6的语法文件server/import.js
	module.exports={
	  "babel-register": "^6.26.0"
	}
	// 3.server/index.js文件，引入一个库，并引入主要文件import.js
	require('babel-register');
    require('./import.js')

	// 4.import.js文件，express
	import express from 'express'
	import forceSSL from 'express-force-ssl'//直接在nuxt.config.js字符串引入会报错req.get 不是一个function
	import router from './router/index.js'
	import {Nuxt, Builder} from 'nuxt'// 编程的方式使用Nuxt
	let config = require('../nuxt.config.js')
	const nuxt = new Nuxt(config)
	const http = require('http'); // http 模块
    const https = require('https'); // https 模块
    http.createServer(app).listen(80)// 需要同时启动80端口，作为http的，443作为https的端口。后续通过使用中间器件express-force-ssl重定向http到https端口去
    https.createServer(httpsOptions, app).listen(443)
    app.use('/api',router) //这里需要注意次序！router 和forceSSL都需要在render之前，否则无法应用生面的中间器件，node 的中间器件是从上到下生效，下会覆盖上的。
    app.use('forceSSL')
    app.use(nuxt.render)
	
```
- 技巧1 在尾部这样写，就可以向外面暴露了
```js
module.exports = app//之前是在nuxt.config.js里面的中间器件的
export default {_io}
```
- 技巧2 使用backpack biubiu的方便开发！ 

- 技巧3 更改本机的HOSTS文件，让你的域名在本地HTTPS生效
```HOST
127.0.0.1 www.admingod.com
```

## 控制台 [次要考虑]

    mongodb config 表，作为全局控制台

* website: [true] 网站打开、[false] 网站关闭，301 重新定向
* register:[true] 开放用户注册，[false]不开放网站用户注册
* website_desc:{String} 网站描述

## 需求分析

### 功能性

### 性能

### 体验性

    登录注册用户，支持第三方用户登录授权。
    额外的小工具
    支持文件下载
    教程
    视频
    移动端适应
    需要将请求的次数叠加到数据中，统计api请求的数据量 [针对路由]
    国际化
    分级权限
    评论
    GitHub
    自动seo
    发表文章
    标题
    内容
    图片
    视频链接
    单独的单页
    目录分级
    菜单栏
    下载组件
    工具
    教程引导文档
    底部指引
    后台登录
    输入框，文章字数，动态字数

### 用户基础信息

#### 个人主页

    主角视角：昵称、个人简介、设置个人信息、文章数、回帖数、
    游客视角：昵称、个人简介、文章数、回帖数、动态

#### 基础信息（新规定，可能后续需要增加身份证，法规要求发帖需要实名）

    用户名
    密码
    昵称
    手机
    email
    头像

## 色系设计

## serverNew 目录结构

    /serverNew
    ----/functions
    	----functions.js
    ----/model
    	----modle.js mongodb 操作模型
    ----/router
    	----index.js api请求入口
    ----config.js 一些数据库配置参数
    ----server-new.back.js 服务端

## mongodb 语法

- `count()`、`length()` 突然发现count()返回的结果不对，当find 是一个空对象的时候
```js
db.getCollection('articles').find({}).length()//18
db.getCollection('articles').find({}).count()//2
db.getCollection('articles').find({post_title:/文章/}).length()//10
db.getCollection('articles').find({post_title:/文章/}).count()//10
```

## mongoose 语法

## 函数

### github markdown 渲染方案

## 数据库设计

### [Collections] router 路由器，放置合法的路由表 {user、###路由保留、}

### [Collections] user

    user_login 登录名 string
    user_pass 密码 string
    user_nickname 昵称 string
    user_email 邮箱 string
    urse_url 个人网站 string
    user_registered 注册时间  2018-2-10 11:49:21
    user_status 用户状态
    display_name  显示的名称

### API 封装规范设计

    （“*” 可选）

#### API response 响应结果 包装

    {
    	errorCode:errror  //状态码，必须会返回
    	data:[]           //返回结果，可选，默认数组
    	msg:'error'       //返回消息，可选，默认success:操作成功||erorr:操作失败
    }

#### 服务端通信 API 返回 http 状态代码设计

2000 是通信基础代码，错误逻辑等同于 2000+http 状态错误码，加上业务代码

* default - 0 `表示正常 /成功`
* 2xx \*
* 3xx 重定向 - 2301 `永久重定向`
  * 2302 `临时重定向`
  * 2304 `没有更改，304客户端缓存代码`

* 4xx 客户端错误 
  - 2401 `*需要用户验证，响应包含询问用户信息，Unauthorized`
  - 2403 `(访问授权,禁止访问)` 
  - 2404 `4xx尚未注册(可能后端找不到，可能前端找不到)` 
  - 2405 `method方式错误`

* 5xx 服务端错误 
  - 2500 `服务器错误（数据库操作失败所致）` 
  - 2504 `服务器查询超时`

## 后端

### 翻页接口函数

### mongodb 语法

* query

```js
// 100章所消时间 - 132.5s
// 50章所消时间 - 114s
// 30章所消时间 - 144s
// 20章所消时间-95.942s
// 10章所消时间-94.01s
// 5章所消时间-226.184s

db
  .getCollection("articles")
  .find({})
  .limit(10)
  .skip(10); // 假如有20条，则从第10开始，截取10条结果返回
db
  .getCollection("articles")
  .find({})
  .limit(10); // 从1 到10条截取
```

* 聚合查询

```js
db.getCollection("articles").aggregate([
  {
    $match: {
      length: {
        $gt: 5000
      }
    }
  },
  {
    $sort: {
      uuid: 1
    }
  },
  {
    $limit: 50
  }
]); // 查询长度大于5000的，数字长度的集合

db.getCollection("novels").aggregate([
  {
    $project: {
      content: {
        $substr: ["$content", 0, 10]
      }
    }
  }
]);
//查到某一列，并生成新列名，并字符串分割,如果使用 substr 会报一个解析的错误
```

* 额外的查询

```js
db.getCollection("novels").distinct("name"); //查询 name 字段多少个值，通过这个，可以查询数据库存储多少本小说
```
### 文章，带导航式的，翻译教程类网站，vuejs.org、mongoose.com等
### 文章 普通文章，带节点类似GitHub的 readme

    - 文章预览（标题、时间、）
    -
    - 文章统计接口

## 系统设计

### 小说下载模块

迫于 npm 安装组件失败，开发暂停

### 翻译组件

    express
    express-session
    socket.io
    socket.io-client
    bodyParser
    axios
    mongoose
    tracer
    node

### 系统组件设计

    账号-加入微博登录
    右侧添加微博账号互动参与
    googel账号引入
    GitHub账号引入
    facebook账号引入
    twitter账号引入
    微信账号引入

### 路由设计 (mongodb: router)

```mongodb
{
	name: 'about',
	status: 1,
	type: 'official'
}
```

* 一级路由
  `beike.io/router`
* 二级路由
  `beike.io/router/router1`

* 三级路由
  `beike.io/router/router1/router2`

```mongodb desgined
路由表：
status:0    原来属于（1、2）类的词汇——被解禁的词汇
status:1    已注册的路由词汇——站方路由，用户
stauts:2    保留的路由词汇——品牌词汇、特殊、国家、组织 **

type: official   官方词汇
type: brand     品牌词汇
type: user      已注册的词汇
type: org(organizations)    组织/团队/小队/工作室等

```

* 默认禁止的词汇 —— 前端+后端禁止写入到 mongodb
  `0-999999 长度的字符串（比如年份之类）`

* status 0 被解禁的可重新申请出的词汇 【前端有专门的分配入口】

* 站方保留词汇 - nuxt page 的 基础路由 - 预设禁止的词汇

| name          | desc      |
| ------------- | --------- |
| about         | 关于      |
| home          | 主页      |
| route         | 路由      |
| router        | 路由      |
| user          | 用户      |
| users         | 用户      |
| manage        | 管理      |
| us            | 我们      |
| organizations | 组织      |
| my            | 我的      |
| your          | 你的      |
| Community     | 社区      |
| book          | 书        |
| app           | 应用      |
| store         | 商店      |
| mall          | 购物中心  |
| shop          | 商店      |
| marker        | 标记      |
| serverNew        | 服务器    |
| service       | 服务      |
| active        | 积极      |
| activation    | 激活      |
| login         | 登录      |
| ssl           | ssl 证书  |
| register      | 注册      |
| logout        | 注销      |
| api           | api，接口 |
| article       | 文章      |
| articles      | 文章      |
| account       | 账号      |

* 用户路由 （默认用户名，至少大于 5 个词汇，除非特殊，注册时候，优先级最高！！）
  `http://beike.io/username`

### 保留的路由词汇

* 品牌词(大部分词汇来自[Brand Icons](http://fontawesome.io/icons/) )

| brand     | desc   |
| --------- | ------ |
| baidu     | 百度   |
| microsoft | 微软   |
| netease   | 网易   |
| adobe     | 奥多比 |
| ……        | ……     |

* 国家

| country | desc |
| ------- | ---- |
| china   | 中国 |
| ……      | ……   |

* 专业术语

| term  | desc       |
| ----- | ---------- |
| js    | javaScript |
| class | 类         |

* More [【Official】：站点路由路径保留词——品牌词（brand words）](https://github.com/veaba/express-nuxt/issues/1)

## 系统架构

### serverNew

    node

### web 容器

    express

### 数据库

    mongodb

### 数据库拓展

    mongoose

### 渲染方案

    nuxt.js 服务端渲染

### 前端技术栈框架

    Vue.js

### 加密算法

    node 自带的crypto对账号进行加密

### 前端 UI 框架

    iView

### 前端自适应

    vue-boostrap 在考虑中...

### WebSocket

    socket.io

### 编辑器

mavon-editor

* blockquote success 写法

```html
	> 我是引文导读我是引文导读我是引文导读我是引文导读
```

* blockquote error 写法

```html
  >> 我是引文导读我是引文导读我是引文导读我是引文导读
```

## package.json

包依赖解释

### \*marked mk 格式文件渲染组件 发现无法渲染 ++文字++ 、sub 、sup 、==标记== 的操作

### markdown-it ### 但 又不能自定义输出 h 标签，而且需要安装很多

### date-fns

时间格式化工具，放弃 moment.js ,原因是，moment.js 太大了

## 兼容特性

    SSL/https
    APM
    PWA 渐进式
    http2.0

添加以下 支持 sass

    "node-sass": "^4.5.3",
    "pug": "^2.0.0-beta6",
    "pug-loader": "^2.3.0",
    "sass-loader": "^6.0.6"

添加 以下 支持 less(可能用于更改 iView 主题定制）

    less  
    less-loader

##　开发笔记

### 如何处理未知的章节页面具体的小说内容所在的 id？

* 因为风格原因，有些命名#content 、有些 BookText,没办法知道内容所在的 id 名称为此，只能这样计算
