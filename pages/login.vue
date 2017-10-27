<!------------------------
 *@name Vue.js
 *@author Jo.gel
 *@date 2017/10/26
 -------------------------->
<template>
    <section class="container">
        登录页面
        <div id="login">
            <Input v-model="value" placeholder="请输入..." style="width: 300px"></Input>
        </div>
    </section>
</template>
<script>
  export default {
    name: 'login',
    components: {
    },
    data () {
      return {
        msg: 'Hello world login VueJS',
        login: 'login',
        password: 'password'
      }
    },
    methods: {}
  }
</script>
<style lang="scss" scoped>

</style>
