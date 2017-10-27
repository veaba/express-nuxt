<template>
  <section class="container">
    <img src="~assets/img/logo.png" alt="Nuxt.js Logo" class="logo" />
    <h1 class="title">
      USERS
    </h1>
    <Button @click="postEvent">Post</Button>
  </section>
</template>

<script>
  export default {
    data () {
      return {}
    },
    methods: {
      postEvent () {
        this.$ajax.get('/api/users/1')
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
  .title {
    margin: 30px 0;
  }
  .users {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .user {
    margin: 10px 0;
  }
</style>
