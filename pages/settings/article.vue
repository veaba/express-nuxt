<!------------------------
 *@name Vue.js
 *@author Jo.gel
 *@date 2018/2/19
 -------------------------->
<template>
  <div class="article">
    {{msg}}
  </div>
</template>
<script>
  export default {
    name: 'article',
    components: {},
    data () {
      return {
        msg: 'Hello world article VueJS'
      }
    },
    methods: {}
  }
</script>
<style lang="scss" scoped>

</style>
