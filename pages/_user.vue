<template>
    <section class="user">
        id
    </section>
</template>

<script>
  export default {
    name: 'v-user',
    data () {
      return {
        keyword: ''
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
      getRouter (router) {
        this.$ajax.get('/api/router', {
          params: {
            router: router
          }
        })
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

<style scoped>

</style>