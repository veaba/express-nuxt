<!------------------------
 *@name Vue.js
 *@author Jo.gel
 *@date 2017/11/26
 -------------------------->
<template>
    <article>
        <section class="section">
            <Row>
                <!--menu区域-->
                <i-col span="4">
                    <Menu>
                        <MenuItem name="home">
                            <Icon type="document"></Icon>
                            文章
                        </MenuItem>
                        <MenuItem name="profile">
                            <Icon type="social-tux"></Icon>
                            简介
                        </MenuItem>
                        <MenuItem name="account">
                            <Icon type="social-html5"></Icon>
                            账号
                        </MenuItem>
                        <MenuItem name="security">
                            <Icon type="social-wordpress"></Icon>
                            安全
                        </MenuItem>
                        <MenuItem name="organizations">
                            <Icon type="social-css3"></Icon>
                            组织
                        </MenuItem>
                    </Menu>
                </i-col>
                <!--内容区域-->
                <i-col span="20">

                </i-col>
            </Row>
        </section>
    </article>

</template>
<script>
  /* eslint-disable quotes */

  export default {
    name: 'settings',
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
