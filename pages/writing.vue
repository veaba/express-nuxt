<!------------------------
 *@name 文章编辑页面
 *@author Jo.gel
 *@date 2018/2/9
 @url 带 ?id=2 则认为是在编辑
 -------------------------->
<template>
    <article>
        <section class="view-section">
            <!--面包屑-->
            <div class="article-breadcrumb">
                <Row>
                    <i-col span="8">
                        <Breadcrumb>
                            <BreadcrumbItem :to="item.path" v-for="(item,index) in breadcrumb" :key="index">
                                <Icon :type="item.icon"></Icon>
                                {{item.name}}
                            </BreadcrumbItem>
                        </Breadcrumb>
                    </i-col>

                    <i-col span="8" offset="8">
                        <!--文章计数-->
                        <div class="article-tips">
                            <span>字数:</span><strong>{{articleItem.post_content.length||0}}</strong>
                        </div>
                    </i-col>

                </Row>

            </div>

            <div class="article-actions">
                <Row>
                    <Button type="primary" class="m-right-5" @click="commitArticle">发表文章</Button>
                    <Button type="ghost" @click="saveArticle">保存文章</Button>
                </Row>
            </div>
          <div class="article-title">
            <Row>
              <i-col span="24">
                <Input v-model="articleItem.post_title" size="large"></Input>
              </i-col>
            </Row>
          </div>
            <mavon-editor
                    v-model="articleItem.post_content"
                    class="article-editor"
                    style="height: 100%;">
            </mavon-editor>
        </section>
    </article>
</template>
<script>
  export default {
    name: 'v-article',
    components: {},
    data () {
      return {
        articleItem: {
          post_title: '22',
          post_content: '222'
        },
        msg: 'Hello world article VueJS',
        breadcrumb: [
          {path: '/settings', icon: 'settings', name: '设置'},
          {path: '/settings/articles', icon: 'clipboard', name: '文章管理'},
          {path: '', icon: this.$route.query.id ? 'compose' : 'edit', name: this.$route.query.id ? '编辑文章' : '新建文章'}
        ]
      }
    },
    mounted () {
    },
    methods: {
      /**
       * @desc 手动保存文章
       * */
      saveArticle () {
        console.info('手动保存文章')
      },
      /**
       * @desc 提交文章发表
       * */
      commitArticle () {
        console.info(this.articleItem)
        this.$ajax.post('/api/publishArticle', this.articleItem)
          .then(res => {
            console.info(res)
          })
          .catch(err => {
            console.info(err)
          })
      }

    }
  }
</script>
<style lang="scss" scoped>
    .article-breadcrumb {
        padding: 20px 0 20px;
        line-height: 30px;
        border-bottom: 1px solid #e9eaec; //#dddee1
    }

    .article-tips {
        display: flex;
        justify-content: flex-end;
        strong {
            font-size: 18px;
        }
    }
    .article-title{
      margin-top: 20px;
    }

    .article-actions {
        margin-top: 20px;
    }

    .article-editor {
        margin-top: 20px;
    }
</style>
