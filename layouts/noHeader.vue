
<!------------------------
 *@name Vue.js
 *@author Jo.gel
 *@date 2017/11/26
 *@desc 适合没有头部的页面
 引用方法
 export default {
    layout:'noHeader'
 }
 -------------------------->
<template>
    <div class="main">
        <!--nuxt 主体内容-->
        <nuxt/>
        <!--尾部组件-->
        <Footer-com></Footer-com>
    </div>
</template>

<script>
  import FooterCom from '~/components/common/Footer.vue'
  export default {
    components: {
      FooterCom
    }
  }
</script>

<style>
    .container {
        margin: 0;
        width: 100%;
        padding: 100px 0;
        text-align: center;
    }

    .button, .button:visited {
        display: inline-block;
        color: black;
        letter-spacing: 1px;
        background-color: #fff;
        border: 2px solid #000;
        text-decoration: none;
        text-transform: uppercase;
        padding: 15px 45px;
    }

    .button:hover, .button:focus {
        color: #fff;
        background-color: #000;
    }

    .title {
        color: #000;
        font-weight: 300;
        font-size: 2.5em;
        margin: 0;
    }
</style>
