/***********************
 * @name article
 * @author Jo.gel
 * @date 2018/3/25
 * @desc 文章操作函数
 ***********************/
import { ArticleModel } from '../model/model'
import {_flipPage, _isAuth, _dbError} from '../functions/functions'

const _article = {
  /**
   * @desc 拉去文章列表函数，正文内容，两百字
   * @desc page 与 skip的关系 1->0、2->10、3->20 page*10-10
   * @TODO 增加模糊查询
   * */
  getArticleList: async (req, res, next) => {
    let session = (req.session && req.session.isAuth) ? req.session.isAuth : false
    _isAuth(res, session)
    let data = req.query.name ? ({name: req.query.title}) : {}
    let page = req.query.page ? req.query.page : 1
    let finArticleAll = await ArticleModel.find(data).count()// 总长度
    let articleArr = await ArticleModel.find(data).limit(10).skip(page * 10 - 10).exec()
    let findArticle = []
    for (let item of articleArr) {
      item.post_content = item.post_content.slice(0, 200)
      let ob = JSON.parse(JSON.stringify(item))
      findArticle.push(ob)
    }

    if (findArticle.length === 0) {
      _dbError(res, '查询为空数据', 4004)
    } else {
      let pages = Math.ceil((finArticleAll / 10))
      await _flipPage(res, findArticle, 0, null, {totals: finArticleAll, pages: pages, pageCurrent: page})
    }
  },
  getArticles: async (ctx, next) => {
    console.info(11)
  }
}

export default _article
