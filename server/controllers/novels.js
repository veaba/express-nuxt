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
import {_dbSuccess} from '../functions/functions'

const _novel = {
  getNovel: (req, res, next) => {
    console.info(req.query)
    let data = {
      novel: '正在下载...'
    }
    return _dbSuccess(res, data)
  }
}

/**
 * @desc 伪造请求头
 * */
// const htmlHeader={
//
// }
/**
 * @desc 解析html代码一级请求数据
 * */
export default _novel
