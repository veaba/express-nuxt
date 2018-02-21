<!------------------------
 *@name Vue.js
 *@author Jo.gel
 *@date 2018/2/21
 -------------------------->
<template>
  <div class="article-menu">
    <div class="menu-header">目录</div>
    <ul class="menu-ul">
      <li v-for="(item,index) in menu">
        <a href="" :href="item.url">{{item.title}}</a>
      </li>
    </ul>
  </div>
</template>
<script>
  export default {
    name: 'articleMenu',
    components: {},
    props: {
      menu: {
        type: [Array, Object]
      }
    },
    data () {
      return {
        msg: 'Hello world articleMenu VueJS'
      }
    },
    methods: {}
  }
</script>
<style lang="scss" scoped>
  .article-menu{
    background: #f8f8f8;
    margin-top: 1em;
    padding: 1em 2em;
    border-radius: 2px;
  }
  .menu-header{
    font-size: 16px;
    font-weight: bold;
    color: #515151;
  }
  .menu-ul{
    li{
      list-style-type:square;//circle square
      position: relative;

      &:before{
        position: absolute;
      }
    }
  }
</style>
