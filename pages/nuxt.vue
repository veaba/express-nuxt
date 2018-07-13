<!------------------------
 *@name Vue.js
 *@author Jo.gel
 *@date 2018/5/2
 -------------------------->
<template>
  <div class="is-nuxt">
    <nuxt-child/>
  </div>
</template>
<script>
  export default {
    name: 'nuxtImport',
    layout: 'guide',
    components: {},
    data () {
      return {
        msg: 'Hello world nuxt VueJS'
      }
    },
    methods: {}
  }
</script>
<style lang="scss" scoped>

</style>
