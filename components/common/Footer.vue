
<template>
  <footer>
    &copy;{{year}} beiKe.io
  </footer>
</template>
<script>
  /* eslint-disable indent */

  export default {
    name: 'v-footer',
    components: {
    },
    data () {
      return {
      }
    },
    computed: {
      year: function () {
        const TheYear = new Date()
        if (TheYear.getFullYear() === 2017) {
          return TheYear.getFullYear()
        } else {
          return '2017-' + TheYear.getFullYear()
        }
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