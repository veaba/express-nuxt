<!------------------------
 *@name 文章编辑页面
 *@author Jo.gel
 *@date 2018/2/9
 -------------------------->
<template>
    <article>
        <section class="view-section">
                {{msg}}
        </section>
    </article>
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
