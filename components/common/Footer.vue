<template>
  <footer>
    &copy;2017 - {{year}} Admingod.com
  </footer>
</template>
<script>
  export default {
    name: 'footer',
    components: {
    },
    data () {
      return {
      }
    },
    computed: {
      year: function () {
        const TheYear = new Date()
        return TheYear.getFullYear()
      }
    }
  }
</script>
<style lang="scss" scoped="">
  footer{
    text-align: center;
    font-size: 14px;
    color: #333;
  }
</style>