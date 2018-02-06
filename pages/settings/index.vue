<!------------------------
 *@name Vue.js
 *@author Jo.gel
 *@date 2017/11/26
 -------------------------->
<template>
    <section class="is-settings">
        {{msg}}
    </section>
</template>
<script>
  /* eslint-disable quotes */

  export default {
    name: 'settings',
    layout: 'console',
    components: {},
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
