<!------------------------
 *@name Vue.js
 *@author Jo.gel
 *@date 2018/2/19
 -------------------------->
<template>
  <article>
    <div class="view-section" :class="styles">
      <Row>
        <i-col span="16">
          <!--文章header-->
          <section class="section section-header">
            <h1>{{articleItem.post_title}}</h1>
          </section>
          <!--文章内容-->
          <section class="section section-content" v-html="compiledMarkdown" v-highlight>
          </section>
        </i-col>
        <i-col span="5" offset="1">
          <aside class="aside">
            <!--个人信息card-->
            <div class="profile">
              <div class="avatar-card">
                <div class="avatar">
                  <Icon type="person" size="100"></Icon>
                </div>
              </div>
              <div class="profile-card">
                <div class="profile-name">{{$store.state.userInfo.nick}}</div>
                <div class="profile-item">
                  <Row>
                    <i-col span="8">
                      <div class="item">
                        <span>回复</span>
                        <strong>66</strong>
                      </div>
                    </i-col>
                    <i-col span="8">
                      <div class="item">
                        <span>文章</span>
                        <strong>103</strong>
                      </div>
                    </i-col>
                    <i-col span="8">
                      <div class="item">
                        <span>身份</span>
                        <strong>超极管理员</strong>
                      </div>
                    </i-col>
                  </Row>
                </div>
              </div>

            </div>
            <!--目录-->
            <article-menu :menu="menusArray">
            </article-menu>
          </aside>
        </i-col>
      </Row>
    </div>
  </article>
</template>
<script>
  /* eslint-disable no-proto */

  import articleMenu from '../components/common/articleMenu'
  import marked from 'marked'
  // marked 不支持 sub  a^2^b
  // marked 不支持 sup  a~2~b
  // marked 不支持 mark  ==ab==
  // marked 不支持 emoJi
  let menusArray = []
  // 默认的marked 对于中文会增加无意义的 id='-'
  let renderer = new marked.Renderer()
  renderer.heading = function (text, level, raw) {
    let ob = {}
    ob.title = text
    ob.url = `#${text}`
    ob.level = level
    menusArray.push(ob)
    return `<h${level} id="${text}"><a href="#${text}">${text}</a></h${level}>`
  }
  export default {
    name: 'v-article',
    components: {
      'article-menu': articleMenu
    },
    data () {
      return {
        msg: 'Hello world article VueJS',
        articleItem: {
          post_title: '',
          post_content: ''
        },
        menusArray: menusArray,
        articleMenus: [],
        input: '# hello',
        styles: 'vueJs_'
      }
    },
    computed: {
      compiledMarkdown: function () {
        marked.setOptions({
          renderer: renderer// 过滤中文不兼容无意义id="-" 字段
        })
        return marked(this.articleItem.post_content)
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
  article {
    background: #fff;
  }

  .section {
    background: #fff;
  }

  .section-header {

  }

  .section-content {

  }

  .profile {
    position: relative;
    width: 100%;
    height: 250px;
    border-radius: 2px;
    background: #f8f8f8;
    .avatar-card {
      width: 100%;
      position: relative;
      height: 40%;
      text-align: center;
      border-top-left-radius: 2px;
      border-top-right-radius: 2px;
      background: linear-gradient(to right bottom, rgb(53, 73, 94), rgb(79, 192, 141));
      .avatar {
        position: absolute;
        background: rgb(255, 255, 255);
        width: 110px;
        height: 110px;
        border-radius: 50%;
        overflow: hidden;
        padding: 5px;
        transform: translate(-50%, 0%);
        left: 50%;
        top: 50%;
      }
    }
    .profile-card {
      height: 60%;
      color: #2c3e50;
      border-bottom-left-radius: 2px;
      border-bottom-right-radius: 2px;
      .profile-name {
        margin-top: 65px;
        text-align: center;
        font-weight: bold;
      }
      .profile-item{
        margin-top: 5px;
        .item{
          text-align: center;
          span{
            display: block;
          }
          strong{
            display: block;
          }
        }
      }
    }
  }

  .aside {
    background: #fff;
  }
</style>
