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
 * @todo 闭包的思想，依然需要注意！
 * @bug todo 默认的列表页数不对
 ***********************/
import { NovelModel, NovelBadUrlModel, ArticleModel } from '../model/model';
import {
  _dbError,
  _dbSuccess,
  _flipPage
} from '../functions/functions';
import { format } from 'date-fns'; // 时间格式工具
import charset from 'superagent-charset'; // 转移模块
import cheerio from 'cheerio'; // 解析字符
import superAgent from 'superagent';
import {_io} from '../import';

const superAgentTo = charset(superAgent); // ajax api http 库 gb2312 或者gbk 的页面，需要  配合charset
const logger = require('tracer').console(); // console追踪库
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
let processTask = []; // 小说下载进程，后续去判断是否存在下载任务，有的话，将需要等待，否则会影响性能
let loopHeader = 1; // 递归loop函数执行此处判断，用于更换header头部参数
/**
 * @desc 定制化判断编码
 * */
async function pageDecode (url, header) {
  logger.warn(url)
  return new Promise((resolve, reject) => {
    superAgent.get(url)
      .set(header)
      .end(async (err, res) => {
        if (err) {
          logger.warn(err)
          logger.warn('识别编码失败');
          reject(err)
        } else {
          logger.warn('对该url进行爬取，判断何种编码', url, '状态编码：' + res.status);
          const $ = await cheerio.load(res.text);
          let host = res.request.host; // 站方的主机名称
          let objMeta = await Array.from($('meta'));
          // 逻辑。如果存在gbk编码则返回false，否则true,utf-8编码成立
          let isTrue = true;
          for (let item in objMeta) {
            if (/(charset=gbk|charset=GBK|charset=GB2342)/.test($(objMeta[item])
              .attr('content'))) {
              isTrue = false;
              resolve({status: false, host: host}); // false 走gbk
              break;
            }
          }
          if (isTrue) {
            resolve({status: true, host: host}); // 因为前面抛出catch，所以，此处的Resolve无效
          }
        }
      });
  });
}
/**
 * @desc 定制化获取章节目录
 * @desc 定制化不存储数据库
 * @todo http://www.mianhuatang.la/23/23460/ 类似这种有倒序，需要判断是有同一个直接上级中，或者去重，后者替换前者
 * */
async function customerCatalogs (url, name, charset, header) {
  if (!url) {
    logger.warn('\n++++ 获取章节部分url 为空');
    return false
  }
  if (!name) {
    logger.warn('\n++++ 获取小说 为空');
    return false
  }
  let superAgentCharset = charset ? superAgent : superAgentTo;
  // 常见用于组合章节元素
  const _ELEMENT = {
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
  const _ELEMENTKeys = Object.keys(_ELEMENT); // element key值数组
  // 解析开始
  return new Promise((resolve, reject) => {
    superAgentCharset
      .get(url)
      .set(header)
      .charset(charset ? '' : 'gbk')
      .end(async (err, res) => {
        if (err) {
          reject(err.text || '页面错误，请稍后再试')
        } else {
          const $ = await cheerio.load(res.text)
          let objArr = Array.from($('*'))
          // let objParentArr = Array.from($('*').parent())
          for (let item of objArr) {
            for (let el in _ELEMENT) {
              if (item.name === el) {
                _ELEMENT[el]++;
              }
            }
          }
          let valuesArr = Object.values(_ELEMENT);
          // 找到数组最大值的所在位置
          let indexMax = valuesArr.indexOf(Math.max.apply(Math, valuesArr));
          // _ELEMENTKeys[indexMax]此时 就是所在标签
          let targetArr = Array.from($(_ELEMENTKeys[indexMax])
            .parent())// 得到父级数组
          let targetMap = {}// 存储map
          for (let item in targetArr) {
            targetMap[item] = $(targetArr[item])
              .children().length// 将个数存储到map中
          }
          let targetKeysArr = Object.values(targetMap)// 存储个数[1,33]数组
          let targetIndexMax = targetKeysArr.indexOf(Math.max.apply(Math, targetKeysArr))// 找到最大值所在的索引
          // 于是，目标标签位置就在，父级的正确索引下的对象的，子级就是正确的目标了
          // todo 但有些是 tr>5个td>a、tr>5个td>a
          // todo 有些是dd>a
          // todo 可能还有些问题
          let chapters = $('body').find($($(_ELEMENTKeys[indexMax]).parent()[targetIndexMax]).children(_ELEMENTKeys[indexMax]));
          let catalogsArr = []; // 组装目录的title 和 href路径
          console.time('定制化url目录循环 Each:');
          $(chapters[0].name).each((index, item) => {
            let obj = {
              title: ($(item)
                .find('a')
                .text()).replace(/(.+?) 第/, '第'), //  正文 第1066章 黑炎出现 =>第1066章 黑炎出现
              href: $(item)
                .find('a')
                .attr('href')
            };
            catalogsArr.push(obj);
          });
          resolve(catalogsArr)
          console.timeEnd('定制化url目录循环 Each:');
          return catalogsArr
        }
      })
  })
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
  /**
   * @desc 目录和href结构
   * 1
   *    目录 http://www.23xs.cc/book/19/index.html
   *    href 12322.html
   *    真实 http://www.23xs.cc/book/19/12322.html
   *
   * 2
   *    目录 http://www.biquge.com.tw/0_854/
   *    href /0_854/568076.html
   *    真实 http://www.biquge.com.tw/0_854/568076.html
   *
   * */
  let checkHasLine = /^\/+/.test(url);// 判断是否是第一个斜杠开头，如果是，则说明是绝对路径，都在相对路径
  let checkHasHttp = /^http+/.test(url)// 有些网站会将标题的url就是直接的单章url
  let theUrl = ''// 真实要去爬取的url
  if (checkHasHttp) { theUrl = url } else {
    theUrl = checkHasLine ? 'http://' + host + url : ((catalogUrl.substr(-1) === '/') ? catalogUrl + url : (catalogUrl.slice(0, catalogUrl.lastIndexOf('/') + 1)) + url);
  }
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
          logger.warn('\n++++第九步/3-err：爬取单章获取内容失败，状态:' + err.status);
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
            if ($(item)
              .text()
              .trim() && ($(item)
              .attr('id') || $(item)
              .attr('class')) && $(item)
              .children('br').length > 10) {
              logger.warn('\n A+++' + index + '____' + $(item)
                .attr('id') + '-------');
              content = $(item)
                .text() || '';
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
    let isHas = await NovelModel.findOne({name: '重生之最强剑神', isVip: 1, title: /第1065章 战/, $where: 'this.content.length<1'})
      .count()
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
  /**
   * @desc 定制化小说部分
   * @warning 定制化下载写入到数据库，会污染全局，定制化不写入数据库
   * @waring 此处是单章写入到webSocket传递
   * */
  customizedNovel: async (req, res) => {
    let name = (req.body.keyword || '').trim();
    let url = (req.body.url || '').trim()
    let startTime = format(new Date(), 'YYYY-MM-DD HH:mm:ss')
    if (!name || !url) {
      await _dbError(res, '请输入要下载的小说名或者目标url');
      return false;
    }
    // 1、判断编码
    let decodeType = await pageDecode(url, htmlHeader[loopHeader])// {status,host}
    // 2、抓取定位所在div,爬取章节数据
    await customerCatalogs(url, name, decodeType.status, htmlHeader[loopHeader])
      .then(catalogs => {
        return new Promise((resolve, reject) => {
          let _index = 0// 全部的索引
          let failIndex = 0// 失败的索引
          catalogs.forEach(async (i, index) => {
            await singleNovel(i.href, url, decodeType.host, i.title, catalogs.length, decodeType.status)
              .then(async single => {
                logger.warn('《' + name + '》 ' + i.title + ' then更新成功');
                i.content = single
                i.index = index
                await _io('download', {index: index, errorCode: 0, data: [i]})
              })
              .catch(singleErr => {
                // todo 失败的个数
                console.info(singleErr);
                failIndex++
              })
            _index++
            if (_index === catalogs.length) {
              resolve({_index: _index, count: catalogs.length, _failIndex: failIndex})
            }
          })
        })
      })
      .then(async obj => {
        let ob = {
          msg: '《' + name + '》,任务完成!',
          bookName: name,
          startTime: startTime,
          failCount: obj._failIndex,
          count: obj.count,
          eventType: 'done' // 事件类型，latest最新
        };
        await downloadCustomer(res, ob) // 如果不存储数据库的话，websocket，每次都会发送一个章节
      })
      .catch(err => {
        console.info(err.status);
      })
  },
  // 手动清除任务栈
  clearNovel: async (req, res) => {
    processTask = [];
    await _dbSuccess(res, '手动清空任务栈成功', processTask, 0);
  },
  /**
   * @desc 下载小说页面
   * @todo 下载任务中，不允许再次提交。并限制
   * @todo 查询耗时太慢，需要优化,34章，耗时1s
   * */
  download: async (req, res) => {
    logger.warn('default 开始下载~~~~~')
    const findPromise = (name, i) => {
      return new Promise(async (resolve, reject) => {
        let data = await NovelModel.find({name: name}, {title: 1, content: 1, index: 1, uuid: 1}).limit(20).skip(i * 20).sort({uuid: 1, index: 1})
        await _io('download', {index: i, errorCode: 0, data: data})
        resolve(data)
      })
    }
    console.time('下载时间耗时:');
    let startTime = format(new Date(), 'YYYY-MM-DD HH:mm:ss');
    let name = req.query.keyword;
    if (!name) {
      await _dbError(res, '请输入要下载的小说名');
      return false;
    }
    // todo 查询500+条，表现太慢，35s，能否分为多条，然后走webSocket返回多条数据同时进行来渲染数据么
    // 1、todo 查询总数目
    let allCount = await NovelModel.find({name: name}).count()
    // 失败的数目
    let failCount = await NovelModel.find({name: name, $where: 'this.content.length<1', isVip: 1}).count();
    let countArr = []// 迭代的數組
    // 2、todo Math.ceil(count) 出来，需要进行的多线程抓取数据库数据，预定100条数据
    for (let i = 0; i < Math.ceil(allCount / 20); i++) {
      countArr.push(i)
    }
    // findPromise(name, i)
    console.time('查询数据库全部章所需时间:');
    const result = await Promise.all(countArr.map(v => findPromise(name, v)))
    console.timeEnd('查询数据库全部章所需时间:');
    if (!allCount) {
      await missionFail('数据库不存在该小说');
      return false;
    }
    await resNotifyClient(res, {
      data: [],
      bookName: name,
      msg: '《' + name + '》下载成功',
      errorCode: 0,
      startTime: startTime,
      timeConsuming: (new Date().valueOf() - new Date(startTime).valueOf()) / 1000,
      failCount: failCount || 0,
      count: allCount,
      endTime: format(new Date(), 'YYYY-MM-DD HH:mm:ss')
    })
  },
  // 小说列表
  getNovelList: async (req, res) => {
    let name = req.query.keyword;
    let page = req.query.page || 1;
    let isVip = req.query.isVip || 0;
    let hasContent = req.query.hasContent || 1;
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
 * @desc 定制化下载小说，数据只会保存在内存里面，一次用完，数据就会清空
 * */
async function downloadCustomer (res, obj) {
  logger.warn(obj)
  logger.warn('++++ 最后：定制化小说爬取完成，总章节' + obj.count + '---------');
  const ob = {
    msg: obj.msg || '《' + obj.bookName + '》,已下载完成!',
    name: obj.bookName,
    startTime: obj.startTime || '',
    timeConsuming:
      (new Date().valueOf() - new Date(obj.startTime).valueOf()) / 1000,
    endTime: format(new Date(), 'YYYY-MM-DD HH:mm:ss'),
    count: obj.count,
    failCount: obj.failCount, // 失败的计数，由catch出来的索引计数
    eventType: obj.eventType || '',
    errorCode: 0
  };
  // 成功执行任务之后，清空任务栈
  processTask = [];
  await res.json(ob)
}
async function resNotifyClient (res, obj) {
  logger.warn(obj)
  logger.warn('++++ 最后：默认小说爬取完成，总章节' + obj.count + '---------');
  // 失败的计数，查询vip 且 内容为空的数目
  let failCount = await NovelModel.find({name: obj.bookName, $where: 'this.content.length<1', isVip: 1}).count();
  const ob = {
    msg: obj.msg || '《' + obj.bookName + '》,已下载完成!',
    data: [],
    name: obj.bookName,
    url: '/api/novel/download?keyword=' + obj.bookName,
    startTime: obj.startTime || '',
    timeConsuming:
      (new Date().valueOf() - new Date(obj.startTime).valueOf()) / 1000,
    endTime: format(new Date(), 'YYYY-MM-DD HH:mm:ss'),
    count: obj.count,
    failCount: failCount,
    eventType: obj.eventType || '',
    errorCode: 0
  };
  // 成功执行任务之后，清空任务栈
  processTask = [];
  await res.json(ob)
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
  } else if (options.hasContent === '0' || !options.hasContent) {
    $where = 'this.content.length<1';
  } else {
    let $where = '1';
  }
  let count = await NovelModel.find({name: options.novel, isVip: Number(options.isVip === '1' ? 1 : 0), $where: $where})
    .count(); // 总长度 sort() -1，倒叙,1默认升序
  let aggregateOb = {name: options.novel, isVip: Number(options.isVip)};
  // 不存在内容或者属于0
  if (!options.hasContent || options.hasContent === '0') {
    aggregateOb.content = '';
  } else {
    delete aggregateOb.content;
  }
  logger.warn(aggregateOb)
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
  let isHasBook = await NovelModel.find({name: options.novel})
    .count() // 判断数据库是否存在该本小说
  let pages = Math.ceil(count / 10);
  if (!isHasBook) {
    logger.warn('数据库不存在该小说');
    await _flipPage(res, data, 1, '获取列表失败', {
      totals: count,
      pages: pages,
      pageCurrent: Number(page)
    });
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
export default _novel
