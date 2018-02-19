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
### 路由设计 (mongodb: router)

``` mongodb
{
	name: 'about',
	status: 1,
	type: 'official' 
}
...
	
``` 
- 一级路由 
```text
beike.io/router
```
- 二级路由 
```text
beike.io/router/router1
```
- 三级路由 
```text
beike.io/router/router1/router2
```
	
``` mongodb desgined
路由表：
status:0    原来属于（1、2）类的词汇——被解禁的词汇
status:1    已注册的路由词汇——站方路由，用户
stauts:2    保留的路由词汇——品牌词汇、特殊、国家、组织 **

type：official   官方词汇
type: brand     品牌词汇
type: user      已注册的词汇
type: org(organizations)    组织/团队/小队/工作室等
	
```
- 默认禁止的词汇 —— 前端+后端禁止写入到mongodb
```text
0-999999 长度的字符串（比如年份之类）
```
- status 0 被解禁的可重新申请出的词汇 【前端有专门的分配入口】
- 站方保留词汇 
	- nuxt page的 基础路由
	- 预设禁止的词汇
```txt 
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
```
- 用户路由 （默认用户名，至少大于5个词汇，除非特殊，注册时候，优先级最高！！）

```text
http://beike.io/username
``` 
####　保留的路由词汇

- 品牌词(大部分词汇来自[Brand Icons](http://fontawesome.io/icons/) )
```
baidu
qihoo
microsoft
netease
360
sun
adobe
		
```
- 国家
```
china
```
- 专业术语

```text
js
class
```
- More [【Official】：站点路由路径保留词——品牌词（brand words）](https://github.com/veaba/express-nuxt/issues/1)
	
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
### date-fns 
	时间格式化工具，放弃moment.js 因为太大了
## 兼容特性
	SSL
	APM
	PWA


添加以下 支持sass

    "node-sass": "^4.5.3",
    "pug": "^2.0.0-beta6",
    "pug-loader": "^2.3.0",
    "sass-loader": "^6.0.6"

添加 以下 支持less(可能用于更改iView 主题定制）