<!------------------------
 *@name Vue.js
 *@author Jo.gel
 *@date 2017/11/26
 -------------------------->
<template>
   <section class="container">
       <h1> settings page</h1>
       <h3>{{msg}}</h3>
   </section>
</template>
<script>
  /* eslint-disable quotes */

  export default {
    name: 'settings',
    components: {
    },
    data () {
      return {
        msg: 'Hello world settings VueJS'
      }
    },
    methods: {}
  }
</script>
<style lang="scss" scoped>

</style>
