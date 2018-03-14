
<!--
@desc 显示不及时的问题
-->
<template>
    <section class="user">
        <H1 style="display: none" v-show="isFind"> 找到用户</H1>

        <H2 style="display: none" v-show="!isFind">404</H2>
    </section>
</template>

<script>
  export default {
    name: 'v-user',
    data () {
      return {
        keyword: '',
        userInfo: {},
        isFind: true
      }
    },
    created () {
      console.info(this.$route.params.user)
      this.keyword = this.$route.params.user
      // TODO 去查询 该路由表存不存在
      // TODO * 被禁路由库
      // TODO * 用户路由库
      this.getRouter(this.keyword)
    },
    methods: {
      /**
       * @desc 找该路由，有结果则返回用户数据
       * */
      getRouter (router) {
        this.$ajax.get('/api/router', {
          params: {
            router: router
          }
        })
          .then(res => {
            this.isFind = res.errorCode === 0
          })
          .catch(err => {
            console.info(err)
          })
      }
    }
  }
</script>

<style scoped>

</style>