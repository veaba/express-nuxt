## server目录结构
	/serverNew
	----/controllers 
		----article.js 文章数据库模块操作
	----/functions
		----functions.js
	----/model
		----modle.js mongodb 操作模型
	----/router
		----index.js api请求入口
	----config.js 一些数据库配置参数
	----serverNew-new.js 服务端
## async/wait 并发处理
- 虽然是并发，但无法得到完整标志
```js
              catalog.forEach(async (i) => {
                await singleNovel(i.href, host)
                // 得到单章文章
                  .then(async single => {
                    logger.error('~~~~~~~~~~得到《' + name + '》单章文章' + i.title + ' Start~~~~~~~~~~')
                    let singleData = {
                      name: name || '',
                      content: single || '',
                      url: i.href || '',
                      host: host || '',
                      length: single.length || 0,
                      title: i['title'] || ''
                    }
                    let saveNovel = new NovelModel(singleData) // 建立小说章节模型
                    // 先判断该部小说是否存在,todo 应该在此之前，查出全部，并放在变量里面，下次就不需要到数据库去查到了
                    let isHas = await NovelModel.findOne({title: i['title'], content: single}).count()
                    if (isHas) {
                      logger.error('~~~~~~~~~~已存在《' + name + '》该章节' + i.title + '~~~~~~~~~~')
                      return
                    } else {
                      logger.error('~~~~~~~~~~正在写入《' + name + '》该章节' + i.title + '~~~~~~~~~~')
                      saveNovel.save() // 写入数据库
                    }
                    logger.error('~~~~~~~~~~得到《' + name + '》单章文章' + i.title + ' End~~~~~~~~~~~~')
                  })
                  .catch(singleErr => {
                    logger.error(singleErr)
                  })
              })

```	
## mongodb 语法
## mongoose 语法
## 函数		
## errorCode 返回约定

