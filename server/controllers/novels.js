/* eslint-disable no-unused-vars */
/***********************
 * @name JS
 * @author Jo.gel
 * @date 2018/4/20
 * @desc 程序设计：
 * @desc 权限检查——>先检查数据库——>如果有，则整理表单并从数据库中下载下来
 * @desc 权限检查——>先检查数据库——>如果没有，到网络上查找，并组织，上传到数据库中，同时下载到用户
 * @updateLog1 无法安装 charset + superAgent +cheerio +superagent-charset(转译模块)  模块，无法进行下一步开发
 * @updateLog2 准备全用promise 来实现正 流程控制，当然需要注意的是对性能的影响
 * @finish 提供webScoket 倒计时下载时间。√，进度条
 * @todo 正在下载的问题，先要比较长度，如果相同，则提示不要再去下载，×
 * @finish 为了减少服务器的压力，存在执行的问题，不在提供下载服务，需要等待任务完成。√，完成
 * @todo 并在前端展示服务器当前压力，是否空闲状态，或者繁忙状态，×，仅仅警告无法处理处理已有的请求
 * @finish 写入库，应该异步操作，不需要await 等待顺序写入库 √并发写入 完成
 * @todo 有些小说，比如纯阳武神，有卷名，比较难办。！！！，章节名可能重叠，且每卷的章节次序需要重新开始计算->用爬取与起点API的对比章节名+预览，并设置uuid来实现唯一id
 * @todo 所以需要去抓取起点的目录，然后拿到目录名称，再去对比章节名，但依然有错漏的问题
 * @todo https://read.qidian.com/ajax/book/category?_csrfToken=trKplZoIC9MzizIxq8JxJvQWPCAJxU9VAbW6ERKr&bookId=3657207 起点拿到章节接口
 * @todo race 有一个resolve或者reject都会返回
 * @finish 客户端按两次，导致函数执行两次，如何清空函数? √，通过progressTask 任务栈来处理
 ***********************/
import {NovelModel} from '../model/model'
import { _dbError, _dbSuccess, _webSocket } from '../functions/functions'
import {format} from 'date-fns' // 时间格式工具
// import fs from 'fs' // 文件读写模块
import charset from 'superagent-charset' // 转移模块
import cheerio from 'cheerio' // 解析字符
import superAgent from 'superagent'
import _io from '../server'
const superAgentTo = charset(superAgent) // ajax api http 库 gb2312 或者gbk 的页面，需要  配合charset
const logger = require('tracer').console() // console追踪库

const htmlHeader = [
  // todo 如果发现查看编码部分的时候status400，则需要重新set header的源
  // baidu:
  {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, sdch',
    'Accept-Language': 'zh-CN,zh;q=0.8,en;q=0.6',
    'Connection': 'keep-alive',
    'Host': 'www.baidu.com',
    'Referer': 'www.baidu.com',
    'Upgrade-Insecure-Requests': 1,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36'
  },
  // biquge:
  {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate',
    'Accept-Language': 'zh-CN,zh;q=0.9',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    // 'Host': 'www.biquge.com.tw',
    'Pragma': 'no-cache',
    'Upgrade-Insecure-Requests': 1,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.146 Safari/537.36'
  },
  // biqukan:
  {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate',
    'Accept-Language': 'zh-CN,zh;q=0.9',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    // 'Host': 'www.biqukan.com',
    'Pragma': 'no-cache',
    'Upgrade-Insecure-Requests': 1,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.62 Safari/537.36'
  }
]
// 常见用于组合章节元素
const ELEMENT = {
  div: 0,
  ul: 0,
  li: 0,
  h2: 0,
  h3: 0,
  h4: 0,
  h5: 0,
  p: 0,
  dl: 0,
  dd: 0,
  dt: 0
}
// element key值数组
const ELEMENTKeys = Object.keys(ELEMENT)

const arrUrls = []// 存储百度搜索的url数组

let ParentNodesMap = {}// 存储查到到的父级标签
// 小说下载进程，后续去判断是否存在下载任务，有的话，将需要等待，否则会影响性能
let processTask = []
let isCharsetDecodeIndex = 0// isCharsetDecode 的索引
let loopIndex = 0// 递归loop函数执行此处判断，同样是选取值的选择索引值
let loopHeader = 0 // 递归loop函数执行此处判断，用于更换header头部参数
let loopHeaderStatus = true// header状态
let loopUrlsStatus = true// url 状态
let isInit = 0
/**
 * @desc 百度搜索并找到解析的小说站点
 * @todo 需要做进一步的判断是否存在目录链接的页面，并排除搜索引擎吸引的网站主页
 * @todo 而非是网站主页，需要是小说主页
 * */
async function searchNovel (keyword) {
  return new Promise((resolve, reject) => {
    // 1 根据 keyword 去百度搜索符合规格的结果
    superAgent
      .get('https://www.baidu.com/s?wd=' + encodeURI(keyword))
      .set(htmlHeader[0])
      .end(async (err, res) => {
        logger.warn('\n++++ 第一步：通过百度搜索引擎去爬取关键字，组装前10条的搜索结果')
        const $ = await cheerio.load(res.text)
        let getTitle = $('h3').find('a:first-child')
        // 获取真实地址的url，异步执行
        getTitle.each(async (item) => {
          let url = $(getTitle[item]).attr('href')
          let title = $(getTitle[item]).text()
          await realUrl(url)// 因为异步获取了url，导致数据回来的顺序不一样
            .then(async (realUrlData) => {
              let obj = {
                title, url: realUrlData
              }
              await arrUrls.push(obj)
            })
            .catch(async errUrl => {
              let obj = {
                title, url: errUrl
              }
              await arrUrls.push(obj)
            })
        })

        let t = 0
        // todo 通过定时器，来大致判断异步任务结束，如果不结束的，强制reject
        let InterTime = setInterval(function () {
          if (t > 9) {
            t = 0
            // 倒计时，发送通知
            clearInterval(InterTime)
            resolve(arrUrls || res.text)
          }
          t++
          logger.warn('\n++++ 第二步：超时等待并发计时开始:' + t + 's')
        }, 1000)
        if (err) {
          logger.warn(err)
          reject(err)
        }
      })
  })
}
/**
 * @desc 获取地址
 * @desc 如果最后一个url带任何字符，则认为不是主页
 * @remove 排除qidian.com
 * @remove 排除tieba.baidu.com
 * @remove 排除sodu.cc
 * */
async function realUrl (url) {
  let errorReject = ''
  return new Promise((resolve, reject) => {
    const rejectTime = setTimeout(() => {
      logger.warn('\n++++ 第三步：再次去异步获取真实url地址，设置10s超时')
      reject(errorReject)
    }, 10000)
    superAgent
      .get(url)
      .set(htmlHeader[0])
      .end(async (err, res) => {
        let theUrl = res.request.url
        let strUrl = theUrl.substr(8) // 从第八个字符截取，取出https://、http://
        if (/\/+./g.test(strUrl) && (theUrl.search(/qidian.com|tieba.baidu.com|sodu.cc/)) < 0) {
          resolve(theUrl)
        } else {
          reject(errorReject)
        }
        if (err) {
          logger.warn(err.status)
        }
        clearTimeout(rejectTime)
      })
  })
}

/**
 * @desc 更换源url递归处理,由于bad 400的错误
 * */
async function loopCharsetDecodeHeader () {
  await logger.warn('\n++++ warn 在执行更换header部分 \n')
  loopHeader++
  // 过滤arrUrls数组，并逐个移除
  if (loopHeader > htmlHeader.length) {
    await logger.warn('\n****** 警告！警告，header参数已超出，请重新新增header参数!\n')
    loopHeaderStatus = false
  } else {
    await isCharsetDecode(arrUrls[loopIndex].url, htmlHeader[loopHeader])
    await logger.warn(arrUrls[loopIndex], loopHeader, loopIndex, arrUrls.length)
    loopHeaderStatus = true
  }
}
/**
 * @desc 更换源url递归处理,
 * */
async function loopCharsetDecodeUrl () {
  await logger.warn('\n++++ warn 在执行更换源URL部分 \n')
  loopIndex++
  if (loopIndex > arrUrls.length) {
    await logger.warn('\n****** 警告！警告，URL参数已超出，请终止程序，排除异常的源URL!\n')
    loopUrlsStatus = false
  } else {
    await isCharsetDecode(arrUrls[loopIndex].url, htmlHeader[loopHeader])
    await logger.warn(arrUrls[loopIndex], loopHeader, loopIndex, arrUrls.length)
    loopUrlsStatus = true
  }
}
/**
 * @desc 判断网站的编码是gbk还是utf-8
 * @return Boolean gbk false;utf-8  true
 * @params url {String}
 * */
async function isCharsetDecode (url, header = htmlHeader[1]) {
  isCharsetDecodeIndex++
  logger.warn('\n判断网站的编码是gbk还是utf-8的次数' + isCharsetDecodeIndex + '\n')
  // 如果不存在url，则换源
  if (!url) {
    logger.warn('-- url 为空', url)
    return false
  } else {
    logger.warn('++ url 有数据', url)
  }
  if (isCharsetDecodeIndex > arrUrls.length) {
    logger.warn('\n++++ error 函数执行超出url地址数组的长度\n')
    return false
  }
  logger.warn('数组的长度', isCharsetDecodeIndex, arrUrls.length)
  return new Promise((resolve, reject) => {
    superAgent
      .get(url)
      .set(header)
      .end(async (err, res) => {
        if (err) {
          logger.warn('\n++++ 第七步/1-error：对该url进行爬取，判断何种编码', url, '状态编码：' + res.status)
          logger.warn(err.status || err)
          isInit++
          logger.warn('\n catch-状态码不正常 ' + err.status + '\n')
          // 第一种异常情况，先更换header 400 错误
          if (Number(err.status) === 400) {
            if (loopHeaderStatus) {
              logger.warn('更换header')
              await loopCharsetDecodeHeader()
            } else {
              logger.warn('\n第一轮更换header情况下，还是失败')
            }
            logger.warn('第一波', loopHeaderStatus, loopIndex, loopHeader, arrUrls.length)
          } else {
            // 第二波，异常情况 先更换urls 400 错误
            // todo 对dealNovel 递归处理,超过arrUrls长度，终止本次爬取任务
            if (loopUrlsStatus) {
              logger.warn('更换源url')
              await loopCharsetDecodeUrl()
            } else {
              logger.warn('\n更换源了还是没什么卵用\n')
            }
            logger.warn('第二波', loopUrlsStatus, loopIndex, loopHeader, arrUrls.length)
          }
          // reject(err)// todo
          logger.warn('要抛出的catch', loopUrlsStatus, loopIndex, loopHeader, arrUrls.length)
        }
        logger.warn('\n++++ 第七步/1-success：对该url进行爬取，判断何种编码', url, '状态编码：' + res.status)
        // 站方的主机名称
        let host = res.request.host
        const $1 = await cheerio.load(res.text)
        let objMeta = await Array.from($1('meta'))
        // 逻辑。如果存在gbk编码则返回false，否则true,utf-8编码成立
        for (let item of objMeta) {
          if (/(charset=gbk|charset=GBK|charset=GB2342)/.test($1(item).attr('content'))) {
            resolve({status: false, host})// false 走gbk
            break
          }
        }
        resolve({status: true, host})// 因为前面抛出catch，所以，此处的Resolve无效
      })
  })
}

/**
 * @desc 如果编码是utf-8此走此部分解析
 * @params url
 * @todo
 * */
async function utf8Charset (url) {
  return new Promise((resolve, reject) => {
    superAgent
      .get(url)
      .set(htmlHeader[1])
      .end(async (err, res) => {
        if (err) {
          logger.warn('\n++++ 第七步/A-error', err.status || err)
          reject(err || 'error')
        } else {
          logger.warn('\n++++ 第七步/A-success：utf-8爬取页面状态：' + res.status)
          const $1 = await cheerio.load(res.text)
          let objArr = Array.from($1('*'))
          for (let item of objArr) {
            for (let el in ELEMENT) {
              if (item.name === el) {
                ELEMENT[el]++
              }
            }
          }
          let valuesArr = Object.values(ELEMENT)
          // 找到数组最大值的所在位置
          let indexMax = valuesArr.indexOf(Math.max.apply(Math, valuesArr))
          let chapters = $1('body').find(ELEMENTKeys[indexMax])
          let catalogsArr = [] // 组装目录的title 和 href路径
          chapters.each((index, item) => {
            let obj = {
              title: $1(item).find('a').text(),
              href: $1(item).find('a').attr('href')
            }
            catalogsArr.push(obj)
          })
          resolve(catalogsArr)
        }
      })
  })
}
/**
 * @desc 如果编码是gbk此走此部分解析
 * @params url
 * @todo
 * */
async function gbkCharset (url) {
  return new Promise((resolve, reject) => {
    superAgentTo
      .get(url)
      .set(htmlHeader[0])
      .charset('gbk')
      .end(async (err, res) => {
        if (err) {
          logger.warn('\n++++ 第七步/B-error', err.status || err)
          reject(err || 'error')
        } else {
          logger.warn('\n++++ 第七步/B-success：gbk爬取页面状态：' + res.status)
          const $1 = await cheerio.load(res.text)
          let objArr = Array.from($1('*'))
          for (let item of objArr) {
            for (let el in ELEMENT) {
              if (item.name === el) {
                ELEMENT[el]++
              }
            }
          }
          let valuesArr = Object.values(ELEMENT)
          // 找到数组最大值的所在位置
          let indexMax = valuesArr.indexOf(Math.max.apply(Math, valuesArr))
          let chapters = $1('body').find(ELEMENTKeys[indexMax])
          let catalogsArr = [] // 组装目录的title 和 href路径
          chapters.each((index, item) => {
            let obj = {
              title: $1(item).find('a').text(),
              href: $1(item).find('a').attr('href')
            }
            catalogsArr.push(obj)
          })
          resolve(catalogsArr)
        }
      })
  })
}

/**
 * @desc 目录抓取和文章抓取主控中心
 * @params obj
 * @params name 小说名字
 * @todo 后续在建立小说关联库，通过小说情节、小说名字、作者名字、主角、配角建立关系库
 * */
async function dealNovel (obj, name) {
  return new Promise(async (resolve, reject) => {
    logger.warn('\n++++ 第六步：开始对爬取的url处理', obj.url)
    // todo 为什么没有办法catch 或者then到抛出的错误?或者finaly
    await isCharsetDecode(obj.url)
      .then(async (resobj) => {
        logger.warn('哔了狗。为什么没有收到then:', resobj)
        let {status, host} = resobj// 状态和主机解构
        // todo utf-8走此部分
        if (status) {
          await utf8Charset(obj.url)
            .then(async catalog => {
              logger.warn('\n++++ 第八步/1：检测到是 utf-8 编码****************')
              // 并发处理
              catalog.forEach(async (i, index) => {
                await singleNovel(i.href, host, i.title, index, catalog.length || 0, status)
                  .then(async single => {
                    await logger.warn('then抓取《' + name + '》单章文章' + i.title + ' Start~~~~~~~~~~')
                    let singleData = {
                      name: name || '',
                      content: single || '',
                      url: i.href || '',
                      host: host || '',
                      uuid: index,
                      length: single.length || 0,
                      title: i['title'] || '',
                      timeout: false
                    }
                    let saveNovel = new NovelModel(singleData) // 建立小说章节模型
                    // 先判断该部小说是否存在,todo 应该在此之前，查出全部，并放在变量里面，下次就不需要到数据库去查到了
                    let isHas = await NovelModel.findOne({title: i['title'], uuid: index}).count()
                    if (!isHas) {
                      if ((single.trim())) {
                        await saveNovel.save() // 写入数据库
                      }
                    }
                    await logger.warn('~~~~~~~~~~then得到《' + name + '》单章文章' + i.title + ' End~~~~~~~~~~~~')
                  })
                  .catch(async errObj => {
                    await logger.warn('~~~~~~~~~~catch得到《' + name + '》单章文章' + i.title + ' Start~~~~~~~~~~')
                    let singleData = {
                      name: name || '',
                      content: errObj.status !== 200 ? '' : errObj.content, // 不等于200写入空字符
                      url: i.href || '',
                      host: errObj.host || '',
                      uuid: errObj.index,
                      length: errObj.content.length || 0,
                      title: errObj.title || '',
                      timeout: true
                    }
                    let saveNovel = new NovelModel(singleData) // 建立小说章节模型
                    // 先判断该部小说是否存在,todo 应该在此之前，查出全部，并放在变量里面，下次就不需要到数据库去查到了
                    let isHas = await NovelModel.findOne({title: i['title'], uuid: errObj.index}).count()
                    if (!isHas) {
                      if ((errObj.content.trim())) {
                        await saveNovel.save() // 写入数据库
                      }
                      await logger.warn('~~~~~~~~~~catch得到《' + name + '》单章文章' + i.title + ' End~~~~~~~~~~~~')
                    }
                  })
              })
              let isTimeout = await NovelModel.findOne({name: name, timeout: true}).count()// 超时的数量
              let t = 0
              // todo 通过定时器，来大致判断异步任务结束，如果不结束的，强制reject
              // todo 60s
              let InterTime = setInterval(function () {
                if (t > 29) {
                  t = 0
                  // 倒计时，发送通知
                  clearInterval(InterTime)
                  let sendObj = {
                    count: catalog.length,
                    failureTotal: isTimeout
                  }
                  resolve(sendObj)
                }
                t++
                logger.warn('\n++++ 第九步/1：并发计时开始:' + t + 's')
              }, 1000)
            })
            .catch(utf8Error => {
              logger.warn(utf8Error.status)
            })
        } else {
          // todo gbk 走此部分
          await gbkCharset(obj.url)
            // 得到目录数组
            .then(async catalog => {
              logger.warn('\n++++ 第八步/2：检测到是 gbk 编码****************')
              // 并发处理
              catalog.forEach(async (i, index) => {
                await singleNovel(i.href, host, i.title, index, catalog.length || 0, status)
                  .then(async single => {
                    await logger.warn('then抓取《' + name + '》单章文章' + i.title + ' Start~~~~~~~~~~')
                    let singleData = {
                      name: name || '',
                      content: single || '',
                      url: i.href || '',
                      host: host || '',
                      uuid: index,
                      length: single.length || 0,
                      title: i['title'] || '',
                      timeout: false
                    }
                    let saveNovel = new NovelModel(singleData) // 建立小说章节模型
                    // 先判断该部小说是否存在,todo 应该在此之前，查出全部，并放在变量里面，下次就不需要到数据库去查到了
                    let isHas = await NovelModel.findOne({title: i['title'], uuid: index}).count()
                    if (isHas) {
                      await logger.warn('~~~~~~~~~~then已存在《' + name + '》该章节' + i.title + '~~~~~~~~~~')
                    } else {
                      await logger.warn('~~~~~~~~~~then正在写入《' + name + '》该章节' + i.title + '~~~~~~~~~~')
                      await saveNovel.save() // 写入数据库
                      await logger.warn('then 对' + index + '进行写入', i.title)
                    }
                    await logger.warn('~~~~~~~~~~then得到《' + name + '》单章文章' + i.title + ' End~~~~~~~~~~~~')
                  })
                  .catch(async errObj => {
                    await logger.warn('~~~~~~~~~~catch得到《' + name + '》单章文章' + i.title + ' Start~~~~~~~~~~')
                    let singleData = {
                      name: name || '',
                      content: errObj.content || '',
                      url: i.href || '',
                      host: errObj.host || '',
                      uuid: errObj.index,
                      length: errObj.content.length || 0,
                      title: errObj.title || '',
                      timeout: true
                    }
                    let saveNovel = new NovelModel(singleData) // 建立小说章节模型
                    // 先判断该部小说是否存在,todo 应该在此之前，查出全部，并放在变量里面，下次就不需要到数据库去查到了
                    let isHas = await NovelModel.findOne({title: i['title'], uuid: errObj.index}).count()
                    if (!isHas) {
                      await logger.warn('~~~~~~~~~~catch正在写入《' + name + '》该章节' + i.title + '~~~~~~~~~~')
                      await saveNovel.save() // 写入数据库
                      await logger.warn('~~~~~~~~~~catch 对' + errObj.index + '进行写入', errObj.title)
                      await logger.warn('~~~~~~~~~~catch得到《' + name + '》单章文章' + i.title + ' End~~~~~~~~~~~~')
                    }
                  })
              })
              let isTimeout = await NovelModel.findOne({name: name, timeout: true}).count()// 超时的数量
              let t = 0
              // todo 通过定时器，来大致判断异步任务结束，如果不结束的，强制reject
              let InterTime = setInterval(function () {
                if (t > 59) {
                  t = 0
                  // 倒计时，发送通知
                  clearInterval(InterTime)
                  let sendObj = {
                    count: catalog.length,
                    failureTotal: isTimeout
                  }
                  resolve(sendObj)
                }
                t++
                logger.warn('并发计时开始:' + t + 's')
              }, 1000)
            })
            .catch(gbkError => {
              logger.warn(gbkError.status)
            })
        }
      })
      .catch(async reje => {
        logger.warn('哔了狗。为什么没有收到catch捕捉到的isInit次数', isInit)// 只有一次捕捉到
        logger.warn('\n++++ 第七步/1-catch：判断何种编码类型部分抛出了错误', reje.status)
      })
  })
}

/**
 * @desc 单章处理，返回promise
 * @param url
 * @param host
 * @param title
 * @param index
 * @param len
 * @param charset false gbk true utf-8
 * */
async function singleNovel (url, host, title, index, len, charset) {
  let isChartSet = charset ? '' : 'gbk'
  let content = ''
  return new Promise((resolve, reject) => {
    let errObj = {
      content: content,
      index: index,
      host: host,
      title: title,
      length: len
    }
    const rejectTime = setTimeout(() => {
      logger.warn('\n++++第九步/2：爬取单章超时30s等待完成')
      reject(errObj)
    }, 30000)
    superAgentTo
      .get('http://' + host + url)
      .set(htmlHeader[1])
      .charset(isChartSet)
      .end(async (err, res) => {
        if (err && err.status && err.response) {
          logger.warn('\n++++第九步/3：爬取单章获取内容和失败，状态:' + err.status)
          reject(err)
        } else {
          // TODO 假如res 为空的时候
          const $ = await cheerio.load(res.text)
          content = await $('#content').text()
          // 除了超时之外reject,还有内容为空也会reject
          logger.warn(typeof content, content.length)
          clearTimeout(rejectTime)
          if (content) {
            await resolve(content)
          } else {
            logger.warn('内容为空', content)
            await reject(errObj)
          }
        }
      })
  })
}

/**
 * @desc 伪造请求头
 * */
const _novel = {
  getNovel: async (req, res, next) => {
    if (!req.query.keyword) {
      _dbError(res)
      return false
    }
    // 存储任务栈，存在的时候，不再进行
    if (Array.isArray(processTask) && processTask.length) {
      _dbError(res, '已有任务进行中，无法进行', processTask)
      return false
    }
    processTask.push(req.query.keyword)
    let msg = '已收到下载任务，由于该任务比较耗时，请耐心等待，完成后系统会通知你。'
    let resData = {
      start: format(new Date(), 'YYYY-MM-DD HH:mm:ss'),
      now: new Date()
    }
    await _dbSuccess(res, msg, resData)
    // 异步任务
    await searchNovel(req.query.keyword)
      .then(async data => {
        logger.warn('\n++++ 第四步：得到真实url地址数组10个，超时url为空')
        logger.warn(data)// 打印url数据
        // todo 过滤为空的url，因为并发，可能失败，此处采取同步处理
        for (let item of data) {
          if (item.url) {
            logger.warn('\n++++ 第五步：不为空url判断', item)
            // todo 默认是采取第一个url，但依然存在潜在问题
            await dealNovel(item, req.query.keyword)
              .then(async obj => {
                obj.startTime = resData.start
                obj.bookName = req.query.keyword
                await notifyClient(obj) // 通过webSocket告诉客户端已完成下载的消息
                await getNovel(req.query.keyword)// webSocket返回小说数据
                logger.warn('\n++++ 第十一步：完成流程')
              })
            break// todo 只循环一次
          }
        }
      })
      .catch(err => {
        logger.warn(err)
      })
  }
}
/**
 * @desc 完成标志，通知客户端
 * */
async function notifyClient (obj) {
  logger.warn('++++ 第十步/1：小说爬取完成，总章节' + obj.count + '---------')
  const ob = {
    msg: '《' + obj.bookName + '》,已下载完成!',
    data: {
      name: obj.bookName,
      url: 'http://www.baidu.com/1.text', // todo
      startTime: obj.startTime || '',
      timeConsuming: (((new Date()).valueOf()) - ((new Date(obj.startTime)).valueOf())) / 1000,
      endTime: format(new Date(), 'YYYY-MM-DD HH:mm:ss'),
      count: obj.count,
      failureTotal: obj.failureTotal
    },
    errorCode: 0
  }
  // 成功执行任务之后，清空任务栈
  processTask = []
  await _io('novel', ob) // 通过webSocket告诉客户端已完成下载的消息
}
/**
 * @desc 返回小说数据
 * */
async function getNovel (novel) {
  logger.warn('++++ 第十步/2：将数据查询后通过webSocket渲染到前端')
  let data = await NovelModel.find({name: novel})
  const ob = {
    msg: novel + '小说数据',
    data: data,
    errorCode: 0
  }
  await _io('novelData', ob)
}
/**
 * @desc 解析html代码一级请求数据
 * */
export default _novel
