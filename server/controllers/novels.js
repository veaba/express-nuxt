/* eslint-disable no-unused-vars,no-const-assign,no-mixed-spaces-and-tabs */
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
 * @finish 正在下载的问题，先要比较长度，如果相同，则提示不要再去下载，先去爬取起点的数据，如果查到库里面和起点的数据一样，则直接从库里面返回，不需要去百度查到
 * @finish 为了减少服务器的压力，存在执行的问题，不在提供下载服务，需要等待任务完成。√，完成
 * @todo 并在前端展示服务器当前压力，是否空闲状态，或者繁忙状态，×，仅仅警告无法处理处理已有的请求
 * @finish 写入库，应该异步操作，不需要await 等待顺序写入库 √并发写入 完成
 * @finish 有些小说，比如纯阳武神，有卷名，比较难办。！！！，章节名可能重叠，且每卷的章节次序需要重新开始计算->用爬取与起点API的对比章节名+预览，并设置uuid来实现唯一id
 * @desc 所以需要去抓取起点的目录，然后拿到目录名称，再去对比章节名，但依然有错漏的问题
 * @finish https://read.qidian.com/ajax/book/category?_csrfToken=trKplZoIC9MzizIxq8JxJvQWPCAJxU9VAbW6ERKr&bookId=3657207 起点拿到章节接口，卷名
 * @todo race 有一个resolve或者reject都会返回
 * @desc 唯一章节id，uuid 由起点uuid接口写入
 * @todo 哨兵变量，用于是否终止异步任务的依据,去中断执行异步、同步任务的执行流水线
 * @todo https://www.qidian.com/search?kw=%E7%BA%AF%E9%98%B3%E6%AD%A6%E7%A5%9E 起点搜索 拿到书id值，将id 传递给查询书的目录
 * @todo 参考1 a 可以在https://book.qidian.com/info/3657207 拿到目录的数目
 * @todo 后续在建立小说关联库，通过小说情节、小说名字、作者名字、主角、配角建立关系库
 * @finish 免费小说目录名字可能错误，随意，需要匹配的序号+额外的名称
 * @todo webSocket 需要返回列表随后交给前端完成余下的
 * @todo 确保起点初次不覆盖那些content
 * @sql db.getCollection('novels').find({name: '圣墟', $where: 'this.content.length>1',isVip:1}).count() //查询vip章节的内容大于1的章节数
 * @sql db.getCollection('novels').update({name: '圣墟',title:'请假一天'},{$set:{'content':'内容炸了'}})  查到并更新到
 * let dbData = await NovelModel.find({name: name}, {title: 1, content: 1}) 只查两列
 * @mongoose await NovelModel.find({name: '圣墟', $where: 'this.content.length>1'}).count()
 * @mongoose db.getCollection('novels').distinct("name") 查询 name 字段多少个值，通过这个，可以查询数据库存储多少本小说
 * @mongoose await NovelModel.findOne({name: name, isVip: 1, title: regTile, $where: 'this.content.length<1'}) 原生shell findOne 没有count()
 * @sql exec()返回promise 否则 query
 * @finish 客户端按两次，导致函数执行两次，如何清空函数? √，通过progressTask 任务栈来处理
 ***********************/
import { NovelModel, NovelBadUrlModel, ArticleModel } from '../model/model';
import {
  _dbError,
  _dbSuccess,
  _flipPage,
  _download
} from '../functions/functions';
import { format } from 'date-fns'; // 时间格式工具
import charset from 'superagent-charset'; // 转移模块
import cheerio from 'cheerio'; // 解析字符
import superAgent from 'superagent';
import _io from '../server';

const superAgentTo = charset(superAgent); // ajax api http 库 gb2312 或者gbk 的页面，需要  配合charset
const logger = require('tracer')
  .console(); // console追踪库
// search 起点
const qiDianHeader = [
  {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'zh-CN,zh;q=0.9',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Host': 'www.qidian.com',
    'Pragma': 'no-cache',
    'Upgrade-Insecure-Requests': 1,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.62 Safari/537.36'
  },
  {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'zh-CN,zh;q=0.9',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Cookie': '_csrfToken=qy4Rd0tr9OeOPGeTbBmP5wFM4mwEehh4nArJXzap; newstatisticUUID=1529775060_1919789918',
    'Host': 'read.qidian.com',
    'Pragma': 'no-cache',
    'Upgrade-Insecure-Requests': 1,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.62 Safari/537.36'
  },
  {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'zh-CN,zh;q=0.9',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Cookie': '_csrfToken=c1T7tQp3nx4YuzLrg6hPImmAdrPh0fDclhAKwnif; pageOps=1; newstatisticUUID=1529845827_59365039; qdrs=0%7C3%7C0%7C0%7C1; qdgd=1; lrbc=3657207%7C294479399%7C1; rcr=3657207; bc=3657207',
    'Host': 'vipreader.qidian.com',
    'Pragma': 'no-cache',
    'Upgrade-Insecure-Requests': 1,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.62 Safari/537.36'
  }
];
/**
 * @desc 自定义的请求头参数，status400/403的时候去变更这个索引值，重新set header 的源，一般是由于host 不对所致
 * */
const htmlHeader = [
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
    // 'Host': 'www.biquge.com.tw', // 导致失败
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
    // 'Host': 'www.biqukan.com', // 导致失败
    'Pragma': 'no-cache',
    'Upgrade-Insecure-Requests': 1,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.62 Safari/537.36'
  },
  {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate',
    'Accept-Language': 'zh-CN,zh;q=0.9',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Cookie': 'UM_distinctid=16437bce479208-074e6984f37387-47e1f32-1fa400-16437bce47bb8f; CNZZDATA1260938422=1896072676-1529941185-%7C1529941185',
    // 'Host': 'www.biqukan.com',
    'Pragma': 'no-cache',
    'Upgrade-Insecure-Requests': 1,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.62 Safari/537.36'
  }
];
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
  dt: 0,
  td: 0
};
let thisCharsetStatus = false; // 先存储当前是何种编码的状态 true utf-8,false gbk
const ELEMENTKeys = Object.keys(ELEMENT); // element key值数组
let arrUrls = []; // 存储百度搜索的url数组
let SentinelVariable = false; // todo 哨兵变量，用于是否终止异步任务的依据
let processTask = []; // 小说下载进程，后续去判断是否存在下载任务，有的话，将需要等待，否则会影响性能
let isCharsetDecodeIndex = 0; // isCharsetDecode 的索引
let loopIndex = 0; // 递归loop函数执行此处判断，同样是选取值的选择索引值
let loopHeader = 1; // 递归loop函数执行此处判断，用于更换header头部参数
let loopHeaderStatus = true; // header状态
let loopUrlsStatus = true; // url 状态
let catalogsCharsetIndex = 1; // gbk 函数的次数
let isInit = 0;
let novelControlIndex = 0; // 主程序的次数
/**
 * @desc 百度搜索并找到解析的小说站点
 * @desc 需要做进一步的判断是否存在目录链接的页面，并排除搜索引擎吸引的网站主页
 * @desc 而非是网站主页，需要是小说主页，通过对比起点章节来判断该页面是否是目录页面
 * */
async function searchNovel (keyword) {
  return new Promise((resolve, reject) => {
    // 1 根据 keyword 去百度搜索符合规格的结果
    superAgent.get('https://www.baidu.com/s?wd=' + encodeURI(keyword))
      .set(htmlHeader[0])
      .end(async (err, res) => {
        logger.warn(
          '\n++++ 第一步：通过百度搜索引擎去爬取关键字，组装前10条的搜索结果'
        );
        const $ = await cheerio.load(res.text);
        let getTitle = $('h3')
          .find('a:first-child');
        // 获取真实地址的url，异步执行
        getTitle.each(async item => {
          let url = $(getTitle[item])
            .attr('href');
          let title = $(getTitle[item])
            .text();
          // 因为异步获取了url，导致数据回来的顺序不一样
          // 且成功或失败都会处理数组组装
          await realUrl(url, keyword)
            .then(async realUrlData => {
              let obj = {
                title,
                url: realUrlData
              };
              await arrUrls.push(obj);
            })
            .catch(async errUrl => {
              let obj = {
                title,
                url: errUrl
              };
              await arrUrls.push(obj);
            });
          // 过滤数组，排除空url，每次循环都会
          let arr = [];
          for (let item of arrUrls) {
            if (item.url) {
              arr.push(item);
            }
          }
          arrUrls = arr;
        });

        let t = 0;
        // 通过定时器，来大致判断异步任务结束，如果不结束的，强制reject url 为空
        let InterTime = setInterval(function () {
          if (t > 4) {
            t = 0;
            clearInterval(InterTime);
            resolve(arrUrls || res.text);
          }
          t++;
          logger.warn('\n++++ 第二步：超时等待5s并发计时开始:' + t + 's');
        }, 1000);
        if (err) {
          logger.warn(err);
          reject(err);
        }
      });
  });
}

/**
 * @desc 获取地址
 * @desc 如果最后一个url带任何字符，则认为不是主页
 * @param url 百度搜索的url。返回真实地址，或者空字符串
 * @param keyword 数目
 * @remove 排除qidian.com
 * @remove 排除tieba.baidu.com
 * @remove 排除sodu.cc
 * @remove 排除 www.zhetian.org
 * */
async function realUrl (url, keyword) {
  // 查到无效url并排除
  let invalidUrlsDB = await NovelBadUrlModel.find({});
  let invalidUrlsArray = [];
  for (let item of invalidUrlsDB) {
    invalidUrlsArray.push(item.url);
  }
  let stringUrl = invalidUrlsArray.join('|');
  let regExpUrl = new RegExp(stringUrl);
  let errorReject = '';
  return new Promise((resolve, reject) => {
    const rejectTime = setTimeout(() => {
      logger.warn(
        '\n++++ 第三步：再次去异步获取真实url地址，设置5s超时结束!reject空字符串'
      );
      reject(errorReject);
    }, 5000);
    logger.warn(url)
    superAgent.get(url)
      .set(htmlHeader[0])
      .end(async (err, res) => {
        let theUrl = res.request.url;
        logger.warn(theUrl)
        let strUrl = theUrl.substr(8); // 从第八个字符截取，取出https://、http://
        if (/\/+./g.test(strUrl) && theUrl.search(regExpUrl) < 0) {
          resolve(theUrl);
        } else {
          reject(errorReject);
        }
        if (err) {
          logger.warn(err.status);
        }
        clearTimeout(rejectTime);
      });
    clearTimeout(rejectTime);
  });
}

/**
 * @desc 更换源url递归处理,由于bad 400的错误
 * @todo 暂时没有用上此部分
 * */
async function loopCharsetDecodeHeader () {
  await logger.warn('\n++++ warn 在执行更换header部分 \n');
  loopHeader++;
  // 过滤arrUrls数组，并逐个移除
  if (loopHeader > htmlHeader.length) {
    await logger.warn(
      '\n****** 警告！警告，header参数已超出，请重新新增header参数!\n'
    );
    loopHeaderStatus = false;
  } else {
    await logger.warn(
      arrUrls[loopIndex],
      loopHeader,
      loopIndex,
      arrUrls.length
    );
    loopHeaderStatus = true;
    await isCharsetDecode(arrUrls[loopIndex].url, htmlHeader[loopHeader])
    // 此时resobj含有 编码状态、主机、url
      .then(async resobj => {
        logger.warn(resobj); // todo为什么会false???
        logger.warn(
          '\n++++ 第七步/1-A-循环变更请求头header解析编码成功了，then：可以进行下去',
          resobj
        );
        // todo
        dealNovel(resobj, resobj.url, processTask[0])
          .then(dealRes => {
            logger.warn(dealRes);
          })
          .catch(async dealErr => {
            await missionFail(
              '任务失败，更换了源header之后，还是失败，实在没办法了'
            );
          });
      })
      .catch(async errobj => {
        logger.warn('\n更换源url递归处理,catch');
        logger.warn(errobj);
        logger.warn(
          '\n++++ 更换源url递归处理，catch：通知客户端无法进行下去',
          errobj.status
        );
        await missionFail(
          '任务失败，更换了源url、源header之后，还是失败，实在没办法了'
        );
      });
  }
}

/**
 * @desc 更换源url递归处理,
 * @desc 由于是异步的原因，第一次都正常情况，但爬取的小说网站，没对上，爬出来都是些无效的数据，这时候需要变更源url
 * */
async function loopCharsetDecodeUrl () {
  await logger.warn('\n++++ warn 在执行更换源URL部分 \n');
  loopIndex++;
  return new Promise(async (resolve, reject) => {
    if (loopIndex > arrUrls.length) {
      logger.warn(
        '\n****** 警告！警告，URL参数已超出，请终止程序，排除异常的源URL!\n'
      );
      loopUrlsStatus = false;
    } else {
      loopUrlsStatus = true;
      await isCharsetDecode(arrUrls[loopIndex].url, htmlHeader[loopHeader])
      // 此时resobj含有 编码状态、主机、url
        .then(async resobj => {
          logger.warn('\n更换源url递归处理,then');
          logger.warn(resobj);
          logger.warn(
            '\n++++ 第七步/1-A-循环变更地址url解析编码成功了，then：可以进行下去',
            resobj
          );
          resolve(resobj);
          return resobj;
        })
        .catch(async errobj => {
          logger.warn('\n更换源url递归处理,catch');
          logger.warn(errobj);
          logger.warn(
            '\n++++ 更换源url递归处理，catch：通知客户端无法进行下去',
            errobj.status
          );
          await _io('missionFail', {
            msg: '任务失败，更换了源url、源header之后，还是失败，实在没办法了',
            data: [],
            errorCode: 1
          });
          reject(errobj);
          return errobj;
        });
    }
  });
}

/**
 * @desc 判断网站的编码是gbk还是utf-8
 * @return Boolean gbk false;utf-8  true，以及主机
 * @params url {String}
 * @desc 对novelControl 递归处理,超过arrUrls长度，终止本次爬取任务
 * @desc 返回是 400 则可能是请求头，需要去对header处理
 * @desc 返回是 403 则可能是url有问题,需要去更改url
 * @desc 循环的时候会循环多少次？而且要明确resolve+reject 的抛出!!!!!
 * @desc reject 是耍了很多次手段换header+换url 都失败都，reject，此时，下一个流水线，理应终止程序进行！！！
 * @desc resolve 只要一个成功，则将流水线继续下去。！！！！
 * @desc 如果只有一个成功，则会resolve，或者一直会陷入reject，知道超时或者失败没办法解析之后自动reject去告诉程序
 * @desc 带了header 反而出错
 * */
async function isCharsetDecode (url, header) {
  isCharsetDecodeIndex++;
  // 如果不存在url，则换源
  if (!url) {
    logger.warn('\n++++ 不存在url，无法继续');
    return false;
  }
  if (!header) {
    logger.warn('\n++++ 不存在header，无法继续');
    return false;
  }
  if (isCharsetDecodeIndex > htmlHeader.length) {
    logger.warn(
      '\n++++ error 函数执行超出header的地址数组长度,打断判断编码函数！\n'
    );
    await missionFail('已超出请求头长度，请联系管理员处理该问题');
    return false;
  }
  return new Promise((resolve, reject) => {
    superAgent.get(url)
      .set(header)
      .end(async (err, res) => {
        if (err) {
          isInit++;
          logger.warn('\n+++++ 第' + isCharsetDecodeIndex + '次,识别编码失败');
          if (!err.status) {
            reject(err);
          }
        } else {
          logger.warn(
            '\n++++ 第七步/1-success：对该url进行爬取，判断何种编码',
            url,
            '状态编码：' + res.status
          );
          let host = res.request.host; // 站方的主机名称
          const $1 = await cheerio.load(res.text);
          logger.warn($1.characterSet);
          let objMeta = await Array.from($1('meta'));
          // 逻辑。如果存在gbk编码则返回false，否则true,utf-8编码成立
          let isTrue = true;
          for (let item in objMeta) {
            if (/(charset=gbk|charset=GBK|charset=GB2342)/.test($1(objMeta[item])
              .attr('content'))) {
              isTrue = false;
              resolve({status: false, host: host, url: url}); // false 走gbk
              break;
            }
          }
          if (isTrue) {
            resolve({status: true, host: host, url: url}); // 因为前面抛出catch，所以，此处的Resolve无效
          }
        }
      });
  });
}

/**
 * @desc 获取章节目录，只是vip章节
 * @param urlAndHeaderObj url header name
 * @param charset 何种编码 true utf-8 false gbk
 * */

async function getCatalogs (urlAndHeaderObj, charset = thisCharsetStatus) {
  catalogsCharsetIndex++;
  let url = urlAndHeaderObj.url;
  let header = urlAndHeaderObj.header
    ? urlAndHeaderObj.header
    : htmlHeader[loopHeader];
  let name = urlAndHeaderObj.name || processTask[0];
  if (!name) {
    logger.warn('\n++++ book 没有找到+' + name);
    return false;
  }
  if (!url) {
    logger.warn('\n++++ 获取章节部分url 为空');
    return false;
  }
  let superAgentCharset = charset ? superAgent : superAgentTo;
  let endSuperStatus = false;
  let errStatus = 0;
  if (endSuperStatus) {
    await missionFail('目录更换源header后，还是失败,错误代码:' + errStatus);
    return false;
  }
  logger.warn('\n 获取目录');
  return new Promise((resolve, reject) => {
    superAgentCharset.get(url)
      .set(header)
      .charset(charset ? '' : 'gbk')
      .end(async (err, res) => {
        if (err) {
          // todo判断是由于header引起的错误，此处的处理方式应该更换heander
          if (err && err.status === 400) {
            logger.warn(
              '\n++++ 第七步/B-error 直接打断，不再进行！获取目录',
              err.status || err
            );
          }
          if (err && err.status === 403) {
            logger.warn('目录被禁用了！');
            await missionFail('由于目录被禁用了,错误代码:' + err.status);
          }
          // 目录更换源header后，还是失败
          if (catalogsCharsetIndex === htmlHeader.length) {
            logger.warn(err);
            logger.warn(err.status, err.text);
            reject(err || 'error');
            logger.warn('目录更换源header后，还是失败');
            errStatus = err.status;
            endSuperStatus = true;
          }
        } else {
          logger.warn(
            '\n++++ 第七步/B-success：爬取目录页面状态：' + res.status
          );
          const $1 = await cheerio.load(res.text);
          let objArr = Array.from($1('*'));
          for (let item of objArr) {
            for (let el in ELEMENT) {
              if (item.name === el) {
                ELEMENT[el]++;
              }
            }
          }
          let valuesArr = Object.values(ELEMENT);
          // 找到数组最大值的所在位置
          let indexMax = valuesArr.indexOf(
            Math.max.apply(Math, valuesArr));
          let chapters = $1('body').find(ELEMENTKeys[indexMax]);
          let catalogsArr = []; // 组装目录的title 和 href路径
          // 组装分类数组
          console.time('目录循环 Each:');
          // 只需要组装vip章节即可，过滤非vip章节
          chapters.each((index, item) => {
            let obj = {
              title: ($1(item).find('a').text()).replace(/(.+?) 第/, '第'), //  正文 第1066章 黑炎出现 =>第1066章 黑炎出现
              href: $1(item).find('a').attr('href'),
              catalogsUrl: urlAndHeaderObj.url
            };
            let isHasVip = NovelModel.find({name: name, title: obj.title, isVip: 1}).count();
            // 如果存在vip章节则组装vip章节
            if (isHasVip) {
              catalogsArr.push(obj);
            }
          });
          console.timeEnd('目录循环 Each:');
          // 对比数据库，如果随机10条，最少5存在，否则不存在，则直接更换源url
          // 如果章节小于20章，可能无法计算！！！这需要在起点爬取目录那一块终止掉程序
          let isVipLen = catalogsArr.length - 20; // 减去总章节10条后，使用随机数来对比5条数据是否与数据库对上
          let randomNumber = Math.ceil(Math.random() * isVipLen); // 得到随机数*(总vip数-10)条=用于截取总vip章节数组
          let subLenArr = catalogsArr.splice(randomNumber, 10); // 截取处理10条章节的数组，由于发现《圣墟》1040章 九幽祇 与https://www.dingdiann.com/ddk74633/ 的1040 九幽只 无法匹配上
          logger.warn(subLenArr);
          let checkNumber = 0; // 如果等于5，则说明取的章节是正确的，如果小于5，则说明当前取的目录url是不对，则需要更换url源
          // 卧槽~~，起点章节名称，有些是 第413章  白雾峡谷 两个空格，你大爷啊
          for (let i = 0; i < 10; i++) {
            await NovelModel.find(
              {name: name, title: subLenArr[i].title})
              .count()
              .then(dbRes => {
                logger.warn(dbRes);
                if (dbRes) {
                  checkNumber++;
                }
                logger.warn(subLenArr[i].title, dbRes);
              })
              .catch(dbErr => {
                logger.warn(dbErr);
              });
          }
          // 等于5，目录正确
          if (checkNumber > 5) {
            logger.warn(
              '对比当前爬取目录的页面是否是正确页面，匹配大于5个章节相符，目录正确',
              checkNumber
            );
            resolve(catalogsArr);
          } else {
            logger.warn(
              '对比当前爬取目录的页面是否是正确页面，匹配小于5个章节不相符，目录不正确',
              checkNumber
            );
            // 记录该错误/无效的url，下次让系统自动排除
            let isHasUrl = await NovelBadUrlModel.find({url: url});
            logger.warn('\n++++ 记录:', url);
            if (!isHasUrl.length) {
              let saveErrorUrls = new NovelBadUrlModel({
                url: url,
                book: name
              });
              await saveErrorUrls.save();
              logger.warn(
                '\n++++ todo 第七步/3 该url' +
                url +
                '是无效的url，已被记录到数据，将在下一次任务中排除!'
              );
            }
            logger.warn('\n++++ 第七步/C -爬取的页面资源不准确，即将更换URL源');
            // todo 可能有问题
            await loopCharsetDecodeUrl() // 更换源url
              .then(loopRes => {
                logger.warn(loopRes);
              })
              .catch(loopErr => {
                logger.warn(loopErr);
              });
          }
        }
      });
  });
}

/**
 * @desc 查到起点数据
 * @param name 书名
 * */
async function searchQiDianBook (name) {
  return new Promise((resolve, reject) => {
    superAgent.get('https://www.qidian.com/search?kw=' + encodeURI(name))
      .set(qiDianHeader[0])
      .end(async (err, res) => {
        if (err) {
          logger.warn(err);
        } else {
          logger.warn('https://www.qidian.com/search?kw=' + encodeURI(name));
          const $ = await cheerio.load(res.text);
          let theBookElement = $(
            '#result-list li:nth-child(1) > div.book-mid-info > h4 > a'
          );
          let ob = {
            bookId: '',
            bookUrl: ''
          };
          if ($(theBookElement).children().text() === name) {
            ob.bookId = $(theBookElement).attr('data-bid');
            ob.bookUrl = $(theBookElement).attr('href');
            resolve(ob);
          } else {
            // 如果找到还是跳出空对象
            reject(ob);
          }
        }
      });
  });
}

/**
 * @desc 获取起点章节预览
 * */
async function getQiDianNovelPreview (url) {
  return new Promise((resolve, reject) => {
    superAgent.get(url)
      .set(qiDianHeader[1])
      .end(async (err, res) => {
        let nullString = '';
        if (err) {
          logger.warn(err.req.text, err.status);
          reject(nullString); // 如果抓取失败，则返回空字符串
        } else {
          let $ = cheerio.load(res.text);
          let content = $('.read-content').text();
          resolve(content);
        }
      });
  });
}

/**
 * @desc 获取起点章节目录+uuid数据
 * @resolve 如果有值，则说明不需要继续更新
 * @reject 如果为0，则说明需要更新，走搜索小说爬取内容步骤
 * */
async function getQiDianNovel (bookName) {
  let bookObj = {};
  await searchQiDianBook(bookName)
    .then(resObj => {
      bookObj = resObj;
    })
    .catch(errObj => {
      bookObj = errObj;
    });
  logger.warn(bookObj);
  // 如果没找到，则跳出，不会在继续执行了
  if (!bookObj.bookId) {
    await missionFail('抱歉，起点无法搜到该小说');
    return false;
  }
  return new Promise(async (resolve, reject) => {
    superAgent.get(
      'https://read.qidian.com/ajax/book/category?bookId=' + bookObj.bookId
    )
    // .set(qiDianHeader[1])
      .set(qiDianHeader[0])
      .end(async (err, res) => {
        if (err) {
          logger.warn(err.status);
          reject(err);
        } else {
          let sourceDataText = await res.text; // 原始起点章节数据
          let sourceDataJson = {};
          try {
            sourceDataJson = await JSON.parse(sourceDataText); // new 可能会有解析失败的bug
          } catch (e) {
            reject(e);
          }
          let sourceData = sourceDataJson.data;
          console.time('testForEach');
          // vip https://vipreader.qidian.com/chapter/3657207/294479399
          // 普通 https://read.qidian.com/chapter/j-mnmPqJ_JM1/klreGIIyhB0ex0RJOkJclQ2
          let isCheckDone = 0;
          sourceData.vs.forEach(async (items, indexs) => {
            isCheckDone = 0;
            items['cs'].forEach(async (item, index) => {
              let qiDianUrl = item.sS
                ? 'https://read.qidian.com/chapter/' + item.cU
                : 'https://vipreader.qidian.com/chapter/' +
                bookObj.bookId +
                '/' +
                item.id;
              // 获取起点章节阅览
              let previewContent = '';
              await getQiDianNovelPreview(qiDianUrl)
                .then(preview => {
                  previewContent = preview;
                })
                .catch(previewErr => {
                  logger.warn(previewErr)
                  previewContent = '';
                });
              let theTitle = (item.cN).replace(/ [ ]+/, ' ')
              // 存在章节与章节名 两个空格 三个空格情况
              let isHas = await NovelModel.findOne({name: bookName, title: theTitle, uuid: item.uuid}).count();
              // 如果不存在，则保存
              if (!isHas) {
                // 构造起点小说目录对象
                let novelCatalogOb = {
                  name: bookName, // 书名
                  uuid: item.uuid, // uuid
                  qiDianUrl: qiDianUrl,
                  qiDianId: item.id,
                  title: theTitle, // cN 标题，有些章节名称是空格，吐血
                  updateTime: item.uT, // uT 更新时间
                  preview: item.sS
                    ? previewContent.substr(0, 200)
                    : previewContent, // 章节预览，vip写入预览，普通写入200字
                  content: item.sS ? previewContent : '', // 如果不存在内容，而且为免费小说。则写入到内容，爬取vip章节内容的时候就不要再一次写入了
                  reel: items.vN, // 卷名vN
                  isVip: item.sS ? 0 : 1, // 起点：sS 1为免费 0为vip，数据库 1vip、0免费
                  length: item.cnt || 0 // cnt  字数
                };
                let saveQiDian = new NovelModel(novelCatalogOb);
                logger.warn('起点写入的章节：' + theTitle)
                await saveQiDian.save();
              }
              isCheckDone++;
            });
          });
          console.timeEnd('testForEach');
          resolve(sourceData.chapterTotalCnt);
        }
      });
  });
}

/**
 * @desc 对目录进行处理，合并起点数据和写入库操作
 * @param resObj {string } {status:false,host:'xx',url:'xx'}gbk false;utf-8  true，以及主机 url
 * @param name 书名
 * @desc 有找到的话，需要写入
 * @desc 第一个空格后的第一个字+序号作为匹配调整，并对异常章节进行标注
 * @desc 查到vip 且内容小于1的，写入章节，如果找不到，则不做其他操作
 * */
async function dealNovel (resObj, name) {
  let {status, host, url} = resObj; // 状态和主机解构
  logger.warn('dealNoveldealNoveldealNovel', url);
  if (!url) {
    logger.warn('\n ++++ 第八步/1-error dealNovel部分url 为空，无法继续');
    return false;
  }
  return new Promise(async (resolve, reject) => {
    // 2 交叉爬取章节和对比起点数据写入到数据库
    thisCharsetStatus = status; // 先存储当前是何种编码的状态 true utf-8,false gbk
    let catalogErr = false; // 如果抓取单章，则跳出抓取目录循环
    logger.warn('即将爬取的小说数据', url, name);
    if (!name) {
      name = processTask[0];
    }
    await logger.warn('\n 开始爬取目录');
    await getCatalogs({url: url, header: htmlHeader[catalogsCharsetIndex], name: name}, status)
      .then(async catalog => {
        logger.warn('\n++++ 第八步/1：检测到是 ' + status ? 'utf-8' : 'gbk' + ' 编码****************');
        console.time('爬取整个目录消耗时间');
        // todo 下一次循环之前只针对尚未爬取的小说，进行爬取，有的话，直接跳过
        // todo 先查找数据库，再去循环分类的章节
        catalog.forEach(async (i, index) => {
          // 1、判断如果不存在content才会去抓取
          let temp = i['title'];
          let title = '';
          temp.replace(/^(.+?) ./, $1 => {
            title = $1;
          });
          let regTile = new RegExp(title);
          let isHas = await NovelModel.findOne({name: name, isVip: 1, title: regTile, $where: 'this.content.length<1'}).count()
          if (isHas) {
            logger.warn('查到内容等于1的vip章节：' + regTile)
            logger.warn({name: name, isVip: 1, title: regTile, $where: 'this.content.length<1'})
            singleNovel(i.href, i.catalogsUrl, host, i.title, catalog.length || 0, status)
              .then(async single => {
                if (single) { logger.warn('then 有内容', single.substr(0, 50)); } else { logger.warn('then 里面没有内容') }
                // 先判断该部小说是否存在,查到该部小说，是vip，则标题对上，则返回数据,如果存在，则将内容更新进来
                let checkHasLine = /^\/+/.test(url);// 判断是否是第一个斜杠开头，如果是，则说明是绝对路径，都在相对路径
                let checkHasHttp = /^http+/.test(url)// 有些网站会将标题的url就是直接的单章url
                let theUrl = ''// 真实要去爬取的url
                if (checkHasHttp) { theUrl = url } else { theUrl = checkHasLine ? 'http://' + host + url : i.catalogsUrl + url; }
                let singleData = {content: single || '', url: theUrl || '', host: host || '', timeout: false, spiderTime: format(new Date(), 'YYYY-MM-DD HH:mm:ss')};
                await NovelModel.update({name: name, title: regTile, $where: 'this.content.length<1', isVip: 1}, {$set: singleData}).exec().then(updateRes => {
                  logger.warn(updateRes, '《' + name + '》 ' + i.title + ' then更新成功');
                });
              })
              .catch(async errObj => {
                // todo 如果走到这一步，就不执行了。
                logger.warn(errObj);
                // 编码错误，去更改headerIndex
                if (errObj.ErrStatus) {
                  if (loopHeader === htmlHeader) {
                    --loopHeader;
                  } else {
                    ++loopHeader;
                  }
                } else {
                  // todo 下一次循环标注这些异常的章节
                  logger.warn('《' + name + '》第 ' + (errObj.title || '未知章节') + ' catch出来异常');
                }
                return false
              });
          }
        });
        console.timeEnd('爬取整个目录消耗时间');
        let t = 0;
        // 通过定时器，来大致判断异步任务结束，如果不结束的，强制reject
        let InterTime = setInterval(function () {
          // 尝试超时设置为10s超时,设置太小无法完成
          if (t > 20) {
            t = 0;
            // 倒计时，发送通知
            clearInterval(InterTime);
            let sendObj = {
              count: catalog.length
            };
            logger.warn('\n 尝试超时设置为10s超时,设置太小无法完成 10s');
            resolve(sendObj);
          }
          t++;
          logger.warn('\n++++ 第九步/1：并发计时开始:' + t + 's');
        }, 1000);
        if (catalogErr) {
          clearInterval(InterTime);
        }
      })
      // 假如catch 或者实在是解析章节情况下，将会通知客户端
      .catch(async utf8Error => {
        logger.warn('\n 爬取目录的之后，catch 有错误，状态码', utf8Error.status, utf8Error);
        reject(utf8Error || '爬取章节错误？？');
      });
  });
}

/**
 * @desc 目录抓取和文章抓取主控中心
 * @params obj
 * @params name 小说名字
 * */
async function novelControl (obj, name) {
  novelControlIndex++;
  logger.warn(obj, name);
  if (!obj || !name) {
    logger.warn('\n url 或name不存在');
    return false;
  }
  if (!obj.url) {
    logger.warn('\n url 或name不存在');
    return false;
  }
  return new Promise(async (resolve, reject) => {
    logger.warn('\n++++ 第六步：开始对爬取的url处理', obj.url);
    let charsetDecodeData = {};
    let charsetDecodeErrorData = null; // catch 出来的报错信息
    console.time('判断单章编码时间');
    await isCharsetDecode(arrUrls[loopIndex].url, htmlHeader[loopHeader])
      .then(resObj => {
        charsetDecodeData = resObj;
        logger.warn(
          '\n++++ 第七步/1-A-解析编码成功了1，then入参参数：',
          resObj
        );
      })
      .catch(reje => {
        console.info(reje);
        charsetDecodeErrorData = reje;
      });
    console.timeEnd('判断单章编码时间');
    if (charsetDecodeErrorData) {
      logger.warn(
        '\n 因为catch而抛出的错误状态码：' + charsetDecodeErrorData.status
      );
    }
    // 可能存在无法链接等原因所致
    if (charsetDecodeErrorData && !charsetDecodeErrorData.status) {
      await missionFail('解码错误，无法继续,由于一些未知的原因导致!');
      return false;
    }
    // 可能是404/403/400等错误
    if (charsetDecodeErrorData && charsetDecodeErrorData.status) {
      await missionFail(
        '解码错误，无法继续，错误代码：',
        charsetDecodeErrorData.status
      );
      return false;
    }
    logger.warn('\n++++ 第七步/2- 起点目录完成，开始爬取小说资源');
    await dealNovel(charsetDecodeData, name)
      .then(dealRes => {
        logger.warn(dealRes);
        resolve(dealRes);
      })
      .catch(dealErr => {
        logger.warn(dealErr);
        reject(dealErr);
      });
  });
}

/**
 * @desc 单章处理，返回promise
 * @param url
 * @param catalogUrl url组合依然有问题
 * @param host
 * @param title
 * @param len
 * @param charset false gbk true utf-8
 * */
async function singleNovel (url, catalogUrl, host, title, len, charset) {
  let isChartSet = charset ? '' : 'gbk';
  let content = '';
  let errObj = {
    content: content,
    host: host,
    title: title,
    length: len
  };
  let checkHasLine = /^\/+/.test(url);// 判断是否是第一个斜杠开头，如果是，则说明是绝对路径，都在相对路径
  let checkHasHttp = /^http+/.test(url)// 有些网站会将标题的url就是直接的单章url
  let theUrl = ''// 真实要去爬取的url
  if (checkHasHttp) { theUrl = url } else { theUrl = checkHasLine ? 'http://' + host + url : catalogUrl + url; }
  logger.warn(len + 'title:' + title)
  return new Promise((resolve, reject) => {
    const rejectTime = setTimeout(() => {
      logger.warn('\n++++第九步/2：爬取单章超时30等待完成');
      reject(errObj);
      clearTimeout(rejectTime);
    }, 30000);
    let superAgentChart = charset ? superAgent : superAgentTo;
    superAgentChart.get(theUrl)
      .set(htmlHeader[1])
      .charset(isChartSet)
      .end(async (err, res) => {
        if (err && err.status && err.response) {
          logger.warn(
            '\n++++第九步/3-err：爬取单章获取内容失败，状态:' + err.status
          );
          clearTimeout(rejectTime);
          let badStatus = {ErrStatus: true};
          reject(badStatus); // 如果错误404/403则抛出err
        } else {
          logger.warn('\n++++ 第九步/3-success：单章页面成功，状态:' + res.status);
          // 匹配到真正的内容，尽管如此，还需要后续的关注。才能产生变种
          const $ = await cheerio.load(res.text);
          let elArr = $('div,dd');// todo 1、有些网站内容放在div。2、有些放在 dd，比如 https://www.23us.so/files/article/html/0/131/9208971.html
          elArr.each((index, item) => {
            // 存在内容&&存在id&&不存在儿子的内容
            // 有些不存在id
            if ($(item).text().trim() && ($(item).attr('id') || $(item).attr('class')) && $(item).children('br').length > 10) {
              logger.warn('\n A+++' + index + '____' + $(item).attr('id') + '-------');
              content = $(item).text() || '';
              // 除了超时之外reject,还有内容为空也会reject
              clearTimeout(rejectTime);
              if (content) {
                resolve(content);
              } else {
                reject(errObj);
              }
              logger.warn('\n++++ 第九步/4:进入单章内容抓取循环')
              return false; // 停止循环
            }
          });
          if (!content) {
            logger.warn('\n++++ 第九步/5 前面的条件无法查到单章内容')
          }
        }
      });
  });
}

/**
 * @desc 路由请求入口
 * */
const _novel = {
  // 临时测试入口
  novelTesting: async (req, res) => {
    logger.warn('临时测试入口')
    // /第2117章 又/
    // 第1065章 战/
    let isHas = await NovelModel.findOne({name: '重生之最强剑神', isVip: 1, title: /第1065章 战/, $where: 'this.content.length<1'}).count()
    logger.warn(isHas)
    res.json({isHas: isHas})
    // superAgent
    // // superAgentTo
    //   .get('https://www.23us.so/files/article/html/0/131/9208971.html')
    //   // http://www.88dus.com/xiaoshuo/38/38812/9054457.html
    //   // http://www.biqukan.com/0_178/15661959.html #content √
    //   // http://www.88dus.com/xiaoshuo/38/38812/9054457.html 不存在 id，只有class √
    //   // http://www.aoyuge.com/35/35920/17712809.html #BoolText
    //   // https://www.booktxt.net/7_7256/2884388.html'
    //   // http://www.biqusa.com/6_6800/14213891.html' 存在div 又存在a标签  ok √ utf-8
    //   // https://m.35wx.com/book/4092/2960555.html'
    //   // http://www.88dus.com/xiaoshuo/38/38812/8893812.html
    //   // https://www.pbtxt.com/105692/32750744.html
    //   // https://www.bequgew.com/1066/3661202.html'
    //   // http://www.biquge.com.tw/16_16058/8904827.html
    //   // https://www.zwdu.com/book/28845/12007265.html
    //   .set(htmlHeader[1])
    //   // .charset('gbk')
    //   .end(async (err, rest) => {
    //     if (!err) {
    //       const $ = await cheerio.load(rest.text);
    //       let elArr = $('div,dd')
    //       elArr.each((index, item) => {
    //         // 存在内容&&存在id&&不存在儿子的内容
    //         // item && ($(item).attr('id') || $(item).attr('class')) && (!($(item).find('div').text())) && (!$(item).find('a').text())
    //         // item && $(item).attr('id') && (!($(item).find('div').text())) && (!$(item).find('a').text()) 有些不存在id
    //         if ($(item).text().trim() && ($(item).attr('id') || $(item).attr('class')) && $(item).children('br').length > 10) {
    //           logger.warn('\n B+++' + $(item).text());
    //         }
    //         // logger.warn($(item).text(), index)
    //       });
    //     } else {
    //       console.info(err);
    //     }
    //   });
    logger.warn('临时测试出口')
  },
  // 小说控制入口
  getNovel: async (req, res) => {
    if (!req.query.keyword) {
      _dbError(res);
      return false;
    }
    // 存储任务栈，存在的时候，不再进行
    if (Array.isArray(processTask) && processTask.length) {
      _dbError(res, '已有任务进行中，无法进行', processTask);
      return false;
    }
    processTask.push(req.query.keyword);
    let msg =
      '已收到下载任务，由于该任务比较耗时，请耐心等待，完成后系统会通知你。';
    let resData = {
      start: format(new Date(), 'YYYY-MM-DD HH:mm:ss'),
      now: new Date()
    };
    await _dbSuccess(res, msg, resData);
    let latestNumber = 0; // 0 则说明 可以继续的，否则直接返回客户端，不需要继续
    // 1、跑起点章节任务，并写入免费章节内容
    console.time('获取起点章节部分');
    await getQiDianNovel(req.query.keyword)
      .then(novelData => {
        latestNumber = novelData;
        logger.warn('起点返回来的目录长度：' + novelData);
      })
      .catch(novelError => {
        logger.warn('\n 起点抓取失败', novelError);
      });
    console.timeEnd('获取起点章节部分');
    // 2、getQiDianNovel 会返回 0或者总章节数
    // 3、处理已更新到最新状态。如果全部内容都有值，且有值的个数等于总章节数，则直接返回成功结果给客户端，下面不需要继续爬取
    // 4、查到如果内容长度大于的个数，如果该个数等于返回的长度，则说明是最新的，且已vip章已爬取
    let isNoUpdate = 0; // 判断是否更新到最新章节
    await NovelModel.find({name: req.query.keyword, $where: 'this.content.length>1'})
      .count()
      .exec()
      .then(countRes => {
        isNoUpdate = countRes;
        logger.warn(countRes);
      })
      .catch(countErr => {
        logger.warn(countErr);
      });
    logger.warn('isNoUpdate', isNoUpdate);
    if (latestNumber && isNoUpdate === latestNumber) {
      logger.warn('已更新到最新');
      let ob = {
        msg: '《' + req.query.keyword + '》,已更新到最新!',
        bookName: req.query.keyword,
        startTime: format(new Date(), 'YYYY-MM-DD HH:mm:ss'),
        count: latestNumber,
        eventType: 'latest' // 事件类型，latest最新
      };
      await webSocketNovelData(ob); // webSocket返回小说数据，异步任务，不需要await
      await notifyClient(ob); // 告诉结果
      return false;
    }
    // 4、如果爬取的章节结果实在太小，小于30章，则终止程序，因为会影响到爬取目录的随机交叉对比的真实性
    if (latestNumber < 30) {
      await missionFail('当前检测到《' + req.query.keyword + '》章节目录小于20，被系统拒绝该任务，抱歉！');
      return false;
    }
    // 异步任务暂时关闭
    // await searchNovel(req.query.keyword)
    //   .then(async data => {
    //     arrUrls = data; // 再次赋值给数组
    //     logger.warn('\n++++ 第四步/1：得到百度搜索的真实数组，并排除无效url', data);
    //   })
    //   .catch(err => {
    //     logger.warn(err);
    //   });
    // 过滤为空的url，因为并发，可能失败，此处采取同步处理
    // 使用循环执行同步任务，确保url是有值的，此处只会执行一次，
    // url http://www.biqukan.com 时好时坏！
    // todo
    arrUrls = [
      {
        title: '圣墟最新章节,圣墟无弹窗广告 - 顶点小说',
        url: 'https://www.23us.so/files/article/html/0/131/index.html'
      }
    ]
    if (Array.isArray(arrUrls) && !arrUrls.length) {
      await missionFail('由于通过搜索引擎爬取失败，无法继续。');
      return false;
    }
    logger.warn(arrUrls[novelControlIndex], arrUrls, novelControlIndex);
    await novelControl(arrUrls[novelControlIndex], req.query.keyword)
      .then(async obj => {
        let objData = obj;
        logger.warn(obj, '已下载完成');
        objData.startTime = resData.start;
        objData.bookName = req.query.keyword;
        let ob = {
          msg: '《' + req.query.keyword + '》,任务完成!',
          bookName: req.query.keyword,
          startTime: format(new Date(), 'YYYY-MM-DD HH:mm:ss'),
          count: latestNumber,
          eventType: 'done' // 事件类型，latest最新
        };
        await webSocketNovelData(ob); // webSocket返回小说数据，异步任务，不需要await
        await notifyClient(objData); // 通过webSocket告诉客户端已完成下载的消息，异步任务，不需要await
        logger.warn('\n++++ 第十一步 A/succees：完成流程');
      })
      .catch(async errObj => {
        // todo 自动更换百度url
        logger.warn(errObj, '\n novelControl catch');
      });
  },
  // 手动清楚任务栈
  clearNovel: async (req, res) => {
    processTask = [];
    await _dbSuccess(res, '手动清空任务栈成功', processTask, 0);
  },
  // 下载小说页面
  download: async (req, res) => {
    console.time('下载时间耗时');
    let name = req.query.keyword;
    if (!name) {
      await _dbError(res, '请输入要下载的小说名');
      return false;
    }
    // todo 查询500+条，表现太慢，35s，能否分为多条，然后走webSocket返回多条数据同时进行来渲染数据么
    console.time('查询数据库所需全部章节列');
    let dbData = await NovelModel.find({name: name}, {title: 1, content: 1}).sort({uuid: 1});
    if (!dbData.length) {
      await missionFail('数据库不存在该小说');
      return false;
    }
    let data = '';
    for (let item of dbData) {
      data = data + item.title + '\n' + item.content + '\n';
    }
    console.timeEnd('查询数据库所需全部章节列');
    await _download(res, '下载成功', data);
  },
  // 小说列表
  getNovelList: async (req, res) => {
    let name = req.query.keyword;
    let page = req.query.page || 1;
    let isVip = req.query.isVip || 0;
    let hasContent = req.query.hasContent || 0;
    if (!name) {
      await _dbError(res, '请输入小说名');
      return false;
    }
    console.time('time 查询数据库列表10个长度');
    await getNovelData(res, {novel: name, page: page, isVip: isVip, hasContent: hasContent});
    console.timeEnd('time 查询数据库列表10个长度');
  }
};

/**
 * @desc webSocket
 * @desc 完成标志，通知客户端
 * @downloads 提供下载地址，新打开标签，并保存为txt，使用脚本工具格式化
 * */
async function notifyClient (obj) {
  logger.warn('++++ 第十步/1：小说爬取完成，总章节' + obj.count + '---------');
  // 失败的计数，查询vip 且 内容为空的数目
  let failCount = await NovelModel.find({name: obj.bookName, $where: 'this.content.length<1', isVip: 1}).count();
  const ob = {
    msg: obj.msg || '《' + obj.bookName + '》,已下载完成!',
    data: {
      name: obj.bookName,
      url: '/api/novel/download?keyword=' + obj.bookName,
      startTime: obj.startTime || '',
      timeConsuming:
        (new Date().valueOf() - new Date(obj.startTime).valueOf()) / 1000,
      endTime: format(new Date(), 'YYYY-MM-DD HH:mm:ss'),
      count: obj.count,
      failureTotal: failCount,
      eventType: obj.eventType || ''
    },
    errorCode: 0
  };
  // 成功执行任务之后，清空任务栈
  processTask = [];
  await _io('novel', ob); // 通过webSocket告诉客户端已完成下载的消息
}
/**
 * @desc webSocket返回结果
 * */
async function webSocketNovelData (ob) {
  logger.warn(ob)
  // 聚合查询，返回到前端的列表
  let queryStatement = await NovelModel.aggregate([
    {
      // 条件查询
      $match: {name: ob.bookName}
    },
    {
      $project: {
        uuid: 1,
        name: 1,
        title: 1,
        length: 1,
        preview: {
          $substrCP: ['$preview', 0, 100]
        },
        isVip: 1,
        hasContent: {
          $gt: [
            {
              $strLenCP: '$content'
            },
            1
          ]
        },
        timeout: 1
      }
    },
    {$sort: {uuid: 1}},
    {$skip: 0},
    {$limit: 10}
  ]);
  // 成功执行任务之后，清空任务栈
  processTask = [];
  let obj = {
    data: queryStatement || [],
    errorCode: 0,
    totals: ob.latestNumber,
    pages: Math.ceil(ob.latestNumber / 10),
    pageCurrent: 1
  }
  await _io('novelData', obj); // 通过webSocket告诉客户端已完成下载的消息
}
/**
 * @desc 返回小说数据,必须直接返回该函数。
 * @param res
 * @param options {object} novel page isVip hasContent
 * */
async function getNovelData (res, options) {
  logger.warn('++++ 第十步/2：将数据查询后通过webSocket渲染到前端');
  logger.warn(options);
  if (!options.novel || !res) {
    logger.warn('++++ 第十步/3：小说书名为空，无法继续查询');
    return false;
  }
  let page = options.page || 1;
  let $where = '1';
  if (options.hasContent === '1') {
    $where = 'this.content.length>1';
  } else if (options.hasContent === '0') {
    $where = 'this.content.length<1';
  } else {
    let $where = '1';
  }
  let count = await NovelModel.find({name: options.novel, isVip: Number(options.isVip === '0' ? 0 : 1), $where: $where}).count(); // 总长度 sort() -1，倒叙,1默认升序
  let aggregateOb = {name: options.novel, isVip: Number(options.isVip)};
  if (!options.hasContent || options.hasContent === '0') {
    aggregateOb.content = '';
  } else {
    delete aggregateOb.content;
  }
  // 聚合查询，返回到前端的列表
  let data = await NovelModel.aggregate([
    {
      // 条件查询
      $match: aggregateOb
    },
    {
      $project: {
        uuid: 1,
        name: 1,
        title: 1,
        length: 1,
        preview: {
          $substrCP: ['$preview', 0, 100]
        },
        isVip: 1,
        hasContent: {
          $gt: [
            {
              $strLenCP: '$content'
            },
            options.hasContent === '1' ? 1 : 0
          ]
        },
        timeout: 1
      }
    },
    {$sort: {uuid: 1}},
    {$skip: Number(page) * 10 - 10},
    {$limit: 10}
  ]);
  let isHasBook = await NovelModel.find({name: options.novel}).count() // 判断数据库是否存在该本小说
  let pages = Math.ceil(count / 10);
  if (!isHasBook) {
    logger.warn('数据库不存在该小说');
    await missionFail('数据库不存在该小说');
    return false;
  } else {
    logger.warn('\n 发送列表');
    return _flipPage(res, data, 0, '获取列表成功', {
      totals: count,
      pages: pages,
      pageCurrent: Number(page)
    });
  }
}

async function missionFail (msg) {
  await _io('missionFail', {
    msg: msg || '任务失败，更换了源url、源header之后，还是失败，实在没办法了',
    data: [],
    errorCode: 1
  })
    .then(res => {
      // 成功执行任务之后，清空任务栈
      processTask = [];
      logger.warn('\n++++ 由于错误导致任务失败， B/error：完成流程');
    });
}

/**
 * @desc 解析html代码一级请求数据
 * */
export default _novel;
