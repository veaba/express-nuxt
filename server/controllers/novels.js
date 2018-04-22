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
 ***********************/
import {NovelModel} from '../model/model'
import { _dbError, _dbSuccess } from '../functions/functions'
// import fs from 'fs' // 文件读写模块
import charset from 'superagent-charset' // 转移模块
import cheerio from 'cheerio' // 解析字符
import superAgent from 'superagent'
const superAgentTo = charset(superAgent) // ajax api http 库 gb2312 或者gbk 的页面，需要  配合charset
const logger = require('tracer').console() // console追踪库

const htmlHeader = {
  baidu: {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, sdch',
    'Accept-Language': 'zh-CN,zh;q=0.8,en;q=0.6',
    'Connection': 'keep-alive',
    'Host': 'www.baidu.com',
    'Referer': 'www.baidu.com',
    'Upgrade-Insecure-Requests': 1,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36'
  },
  biquge: {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate',
    'Accept-Language': 'zh-CN,zh;q=0.9',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Cookie': '__jsluid=fba66a62b12c3592597aafe90b52ed23; UM_distinctid=162e7c9d0d0baf-03fea7584ead5c-c343567-1fa400-162e7c9d0d1980; CNZZDATA1272873873=1794966399-1524306872-https%253A%252F%252Fwww.baidu.com%252F%7C1524398767',
    'Host': 'www.biquge.com.tw',
    'Pragma': 'no-cache',
    'Upgrade-Insecure-Requests': 1,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.146 Safari/537.36'
  }
}
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

// 小说下载进程，后续去判断是否存在下载任务，有的话，将需要等待，否则会影响性能
const processTask = []

/**
 * @desc 百度搜索并找到解析的小说站点
 * */
async function searchNovel (keyword) {
  return new Promise((resolve, reject) => {
    // 1 根据 keyword 去百度搜索符合规格的结果
    superAgent
      .get('https://www.baidu.com/s?wd=' + encodeURI(keyword))
      .set(htmlHeader.baidu)
      .end(async (err, res) => {
        const $ = await cheerio.load(res.text)
        let getTitle = $('h3').find('a:first-child')
        const arr = []
        getTitle.each((index, item) => {
          let obj = {
            title: $(item).text(),
            url: $(item).attr('href')
          }
          // 移除关键字
          if (($(item).text().indexOf('起点中文网')) < 0) {
            arr.push(obj)
          }
        })
        if (err) {
          console.info(err)
        }
        resolve(arr || res.text)
      })
  })
}

/**
 * @desc 判断网站的编码是gbk还是utf-8
 * @return Boolean gbk false;utf-8  true
 * @params url {String}
 * */
async function isUTF8Charset (url) {
  return new Promise((resolve, reject) => {
    superAgent
      .get(url)
      .set(htmlHeader.baidu)
      .end(async (err, res) => {
        // 站方的主机名称
        let host = res.request.host
        const $1 = await cheerio.load(res.text)
        let objMeta = $1('meta').html('charset')
        // 逻辑。如果存在gbk编码则返回false，否则true,utf-8编码成立
        for (let item in objMeta) {
          if (/(gbk|GBK|GB2342)/.test(objMeta[item].attribs.content)) {
            resolve({status: false, host})
            break
          }
        }
        // logger.error(host) // 可以拿到host
        resolve({status: true, host})
        if (err) {
          logger.error(err)
          reject(err)
        }
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
      .set(htmlHeader)
      .end(async (err, res) => {
        const $1 = await cheerio.load(res.text)
        let getCatalog = $1('dd').find('a').text()
        // 去找到该dom，最长的那个长度,|| 再存主机名字
        logger.error(getCatalog)
        resolve(getCatalog || '@@@@@')
        if (err) {
          logger.error(err)
          reject(err || 'errooor')
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
      .set(htmlHeader.baidu)
      .charset('gbk')
      .end(async (err, res) => {
        console.info('~~~~~~~~~~~start~~~~~~~~~~~~~')
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
        logger.error(catalogsArr)
        console.info('~~~~~~~~~~~end~~~~~~~~~~~~~')
        resolve(catalogsArr)
        if (err) {
          logger.error(err)
          reject(err || 'errooor')
        }
      })
  })
}

/**
 * @desc 目录抓取和文章抓取主控中心
 * @params obj
 * @params name 小说名字，后续在建立小说关联库，通过小说情节、小说名字、作者名字、主角、配角建立关系库
 * */
async function dealNovel (obj, name) {
  return new Promise(async (resolve, reject) => {
    await isUTF8Charset(obj.url)
      .then(async (resobj) => {
        let {status, host} = resobj// 状态和主机解构
        if (status) {
          await utf8Charset(obj.url) // utf-8走此部分
        } else {
          await gbkCharset(obj.url) // gbk 走此部分
            // 得到目录数组
            .then(async catalog => {
              logger.error(catalog)
              // for 循环批量处理单章
              // http://www.biquge.com.tw/16_16279/6516764.html
              for (let i of catalog) {
                await singleNovel(i.href, host)
                // 得到单章文章
                  .then(single => {
                    let singleData = {
                      name: name || '',
                      content: single || '',
                      url: i.href || '',
                      host: host || '',
                      length: single.length || 0,
                      title: i['title'] || ''
                    }
                    let saveNovel = new NovelModel(singleData) // 建立小说章节模型
                    // saveNovel.save() // 写入数据库
                    logger.error('~~~~~~~~~~得到单章文章 Start~~~~~~~~~~')
                    logger.error(single)
                    logger.error('~~~~~~~~~~得到单章文章 End~~~~~~~~~~~~')
                  })
                  .catch(singleErr => {
                    logger.error(singleErr)
                  })
              }
            })
            .then(item => {
              logger.error(item)
            })
        }
      })
      .catch(reje => {
        logger.error(reje)
      })
  })
}

/**
 * @desc 单章处理，返回promise
 * @params url host 主机
 * */
async function singleNovel (url, host) {
  logger.error(url, host)
  return new Promise((resolve, reject) => {
    superAgentTo
      .get('http://' + host + url)
      .set(htmlHeader)
      .charset('gbk')
      .end(async (err, res) => {
        // TODO 假如res 为空的时候
        console.info('~~~~~~~~~~单章Start~~~~~~~~~~')
        const $ = await cheerio.load(res.text)
        console.info('~~~~~~~~~~单章 End~~~~~~~~~~')
        // TODO 自动判断那个节点是章节内容的
        let content = $('#content').text()
        logger.error(content)
        resolve(content)
        // todo 为什么这是被加速了给禁止了
        if (err) {
          logger.error(err.text)
        }
      })
  })
}

/**
 * @desc 全部章节写入数据库
 * @todo
 * */
// async function writeMongodb () {
//   return new Promise((resolve, reject) => {
//
//   })
// }
/**
 * @desc 移除所有属于无关节点
 * */
/**
 * @desc 伪造请求头
 * */

const _novel = {
  getNovel: async (req, res, next) => {
    if (!req.query.keyword) {
      _dbError(res)
      return
    }
    // let msg = '正在下载...'
    await searchNovel(req.query.keyword)
      .then(async data => {
        await dealNovel(data[0], req.query.keyword)
          // resolve 到主机名称
          .then(catalog1 => {
            logger.error(catalog1)
            // 先对一个数组的url 去搜小说
            // if (data.length > 0) {
            //   return _dbSuccess(res, msg, url || '~~~~~~~name')
            //   // return url
            // } else {
            //   return []
            // }
          })
      })
      .then(catalog => {
        logger.error(catalog)
      })
  }
}

/**
 * @desc 解析html代码一级请求数据
 * */
export default _novel
