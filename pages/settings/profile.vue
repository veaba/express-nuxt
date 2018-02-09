<!------------------------
 *@name Vue.js
 *@author Jo.gel
 *@date 2018/2/9
 -------------------------->
<template>
    <div class="profile">
        {{msg}}
    </div>
</template>
<script>
  export default {
    name: 'profile',
    components: {},
    data () {
      return {
        msg: 'Hello world profile VueJS'
      }
    },
    methods: {}
  }
</script>
<style lang="scss" scoped>

</style>
