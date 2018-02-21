<!------------------------
 *@name Vue.js
 *@author Jo.gel
 *@date 2018/2/19
 -------------------------->
<template>
  <article>
    <div class="view-section">
      <Row>
        <i-col span="16">
          <!--文章header-->
          <section class="section section-header">
            <h1>{{articleItem.post_title}}</h1>
          </section>
          <!--文章内容-->
          <section class="section section-content" v-html="compiledMarkdown">
          </section>
        </i-col>
        <i-col span="7" offset="1">
          <aside class="aside">
            sddd
          </aside>
        </i-col>
      </Row>
    </div>
  </article>
</template>
<script>
  import marked from 'marked'

  export default {
    name: 'v-article',
    components: {},
    data () {
      return {
        msg: 'Hello world article VueJS',
        articleItem: {
          post_title: '',
          post_content: ''
        },
        input: '# hello'
      }
    },
    computed: {
      compiledMarkdown: function () {
        return marked(this.articleItem.post_content, {sanitize: true})
      }
    },
    created () {
      let articleId = this.$route.query.id
      if (articleId) {
        this.getSingleAPI(articleId)
      }
    },
    methods: {
      /**
       * @desc 获取文章
       * */
      getSingleAPI (id) {
        this.$ajax.get('/api/getArticle', {
          params: {
            id: id
          }
        })
          .then(res => {
            if (res.errorCode === 0) {
              this.articleItem = res.data
            }
          })
          .catch(err => {
            console.info(err)
          })
      }
    }
  }
</script>
<style lang="scss" scoped>
  .section {
    background: #fff;
  }

  .section-header {

  }

  .section-content {

  }

  .aside {
    border: 1px solid green;
    background: #fff;
  }
</style>
