<!------------------------
 *@name Vue.js
 *@author Jo.gel
 *@date 2018/2/6
 -------------------------->
<template>
    <div class="iam-router">
        {{msg}}
    </div>
</template>
<script>
  export default {
    name: 'router',
    layout: 'console',
    components: {
    },
    data () {
      return {
        msg: 'Hello world router VueJS'
      }
    },
    methods: {}
  }
</script>
<style lang="scss" scoped>

</style>
