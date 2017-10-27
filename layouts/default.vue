<!--
    html5 标签 标准 http://www.w3school.com.cn/tags/index.asp
-->
<template>
    <div class="main">
        <!--头部文件-->
        <Header-com></Header-com>
        <!--nuxt 主体内容-->
        <nuxt/>
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
