<!------------------------
 *@name Vue.js
 *@author Jo.gel
 *@date 2018/5/2
 *@desc guide 教程类指引menu
 -------------------------->
<template>
  <div class="main">
    <!--头部文件-->
    <Header-com></Header-com>
    <!--nuxt 主体内容-->
    <article class="article">
      <section class="all-section workspace">
        <Row type="flex">
          <i-col span="3" class="work-menu" style="overflow-y: auto;">
            <p>教程类</p>
            <p>112</p>
            <p>333</p>
          </i-col>
          <!--内容区域-->
          <i-col span="21" style="padding-left: 20px;margin-top: 20px;">
            <section class="work-content">
              <nuxt class="container"/>
            </section>
          </i-col>
        </Row>
      </section>
    </article>
    <!--尾部组件-->
    <Footer-com></Footer-com>
  </div>
</template>

<script>
  import HeaderCom from '~/components/common/Header.vue'
  import FooterCom from '~/components/common/Footer.vue'

  export default {
    name: 'guide',
    components: {
      HeaderCom, FooterCom
    },
    data () {
      return {
        menu: {
          // 路由
          'router-list': '/settings/router',
          'router-forbidden': '/settings/router/forbidden',
          'router-permission': '/settings/router/permission',
          // 用户
          'users-list': '/settings/users',
          'users-forbidden': '/settings/users/forbidden',
          'users-permission': '/settings/users/permission',
          'account': '/settings/account', // 账号
          'articles': '/settings/articles', // 文章管理
          'profile': '/settings/profile', // 简介
          'security': '/settings/security',
          'organization': '/settings/organization'
        }
      }
    },
    computed: {
      /**
       * @desc 展开的名称
       * */
      openName () {
        let route = this.$store.state.route
        this.$nextTick(() => {
          if (process.browser) {
            this.$refs.menu.updateOpened()
          }
        })
        let path1 = []
        let path2 = []
        if (route) {
          let pathTemp = route.fullPath.slice(1)
          pathTemp = pathTemp.split('/')
          // 至少两组
          if (pathTemp.length > 1) {
            for (let i = 0; i <= pathTemp.length; i++) {
              for (let j = 0; j < i; j++) {
                path1.push(pathTemp[j])
              }
            }
            if (path1.length > 0) {
              for (let k = 1; k <= pathTemp.length; k++) {
                let newStr = path1.splice(0, k)
                path2.push(newStr.join('-'))
              }
            }
          }
          return path2
        }

        return ['settings', 'protect-report']
      },
      /**
       * @desc menu激活名称
       * */
      activeName () {
        let route = this.$store.state.route
        if (route) {
          let path = route.fullPath.slice(1)
          path = path.split('/')
          return path.join('-')
        }
        return '/'
      }
    },
    methods: {
      onSelectPage (name) {
        console.info(name)
        this.$router.push(this.menu[name])
      }
    }
  }
</script>

<style lang="scss" scoped>
  .article {
    display: flex;
    flex: 1;
    width: 100%;
    height: 100%;
    flex-direction: column;
  }
  .workspace {
    padding: 0 20px;

  }

  .work-menu {
    margin-top: 20px;
  }

  .works-content {
    border: 1px solid violet;
  }

</style>

