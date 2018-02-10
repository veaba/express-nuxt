# 基于expreess 的nuxt服务端渲染网站
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
#### 基础信息（新规定，可能后续需要增加身份证，法规要求发帖需要实名）
	用户名
	密码
	昵称
	手机
	email
	头像
	
## 色系设计	
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
	errorCode:3 访问授权
	errorCode:4 尚未注册
	errorCode:5 查询超时
	errorCode:-1 服务器错误
	...
## 系统设计
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
### 用户URL路径设计（尚未）
	http://beike.io/username
### 路由保留，以下路由不开放给用户（用户名，至少大于5个词汇）

#### 默认禁止的词汇
	0-999999 长度的字符串（比如年份之类）
#### *【路由特别分配渠道】
	假如是特定的权限的话，是可以重新调用被禁止的路由词汇
#### 站方保留词汇
	about
	home
	route
	router
	user
	users
	manage
	us
	organizations
	my
	your
	Community
	book
	app
	store
	mall
	shop
	marker
	server
	service
	active
	login
	register
	logout
	api
	article 文章
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
### 前端自适应
	vue-boostrap 在考虑中...	
### WebSocket
	socket.io
	
### 编辑器
	mavon-editor
##　package.json
## 兼容特性
	SSL
	APM
	PWA


添加以下 支持sass

    "node-sass": "^4.5.3",
    "pug": "^2.0.0-beta6",
    "pug-loader": "^2.3.0",
    "sass-loader": "^6.0.6"
