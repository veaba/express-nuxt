# 基于expreess 的nuxt服务端渲染网站

## 数据库设计
### [待完善]API封装 
	（“*” 可选）
	
#### [待完善]API 正常
	normal：
	{
		errorCode:0
		data:[],
		*msg:'success'
	}
#### [待完善]API 错误
	error：没有找到
	{
		errorCode:1
		data:[]
		*msg:'error'
	}
##### [待完善]errorCode 错误代码设计,加上业务代码	
	errorCode:0 正常/成功
	errorCode:1 没有找到
	errorCode:2 method方式错误
	errorCode:3 查询超时
	errorCode:4 尚未注册
	errorCode:5 访问授权
	errorCode:-1 服务器错误
	...
## 系统设计
### 用户URL路径设计（尚未）
	http://beike.io/username
### 路由保留，以下路由不开放给用户
#### 站方
	about
	home
	user
	users
	manage
	us
	server
	service
	active
	...
#### 品牌词(大部分词汇来自[Brand Icons](http://fontawesome.io/icons/) )
	baidu
	qihoo
	microsoft
	netease
	360
	sun
	adobe
[【Official】：站点路由路径保留词——品牌词（brand words）](https://github.com/veaba/express-nuxt/issues/1)
#### 国家
	china
	...
#### 专业术语
	class 
	js
	javascript
	vue
	vuejs
	java
	...
	
	
## 系统架构
### server
	node
### web容器
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
### 前端UI框架
	iView
### WebSocket
	socket.io
##　package.json


添加以下 支持sass

    "node-sass": "^4.5.3",
    "pug": "^2.0.0-beta6",
    "pug-loader": "^2.3.0",
    "sass-loader": "^6.0.6"
> exepress nuxt ssr

## Build Setup


## Backpack

We use [backpack](https://github.com/palmerhq/backpack) to watch and build the application, so you can use the latest ES6 features (module syntax, async/await, etc.).
