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
    asyncData (context) {
      console.info(context)
      // console.info(context)
      // return { project: 'nuxt' }
      return context.error()
    },

    created () {
      console.info(this.$route.params.user)
      this.keyword = this.$route.params.user
      // TODO 去查询 该路由表存不存在
      // TODO * 被禁路由库
      // TODO * 用户路由库
    },
    methods: {
      // getRouter () {
      //   console.info(1)
      // }
    }
  }
</script>

<style scoped>

</style>