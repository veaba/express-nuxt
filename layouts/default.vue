<!--
    html5 标签 标准 http://www.w3school.com.cn/tags/index.asp
-->

<style scoped>
    .layout{
        border: 1px solid #d7dde4;
        background: #f5f7f9;
    }
    .layout-logo{
        width: 100px;
        height: 30px;
        background: #5b6270;
        border-radius: 3px;
        float: left;
        position: relative;
        top: 15px;
        left: 20px;
    }
    .layout-nav{
        width: 420px;
        margin: 0 auto;
    }
    .layout-assistant{
        width: 300px;
        margin: 0 auto;
        height: inherit;
    }
    .layout-breadcrumb{
        padding: 10px 15px 0;
    }
    .layout-content{
        min-height: 200px;
        margin: 15px;
        overflow: hidden;
        background: #fff;
        border-radius: 4px;
    }
    .layout-content-main{
        padding: 10px;
    }
    .layout-copy{
        text-align: center;
        padding: 10px 0 20px;
        color: #9ea7b4;
    }
</style>
<template>
    <div class="main">
        <!--头部文件-->
        <Header-com></Header-com>
        <!--nuxt 主体内容-->
        <nuxt class="container"/>
        <!--尾部组件-->
        <Footer-com></Footer-com>
    </div>
</template>

<script>
  import HeaderCom from '~/components/common/Header.vue'
  import FooterCom from '~/components/common/Footer.vue'

  export default {
    components: {
      HeaderCom, FooterCom
    }
  }
</script>

<style lang="scss">
    .container {
        margin: 0;
        width: 100%;
        text-align: center;
        background: #f7f7f7;
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
