<!------------------------
 * @name Vue.js
 * @author Jo.gel
 * @date 2017/10/26
 -------------------------->
<style scoped lang="scss">
    .layout {
        border: 1px solid #d7dde4;
        background: #f5f7f9;
    }

    .layout-logo {
        display: flex;
        align-items: center;
        width: 60px;
        background: url("/assets/img/common/logo-60x40.png") no-repeat center;
        border-radius: 3px;
        position: relative;

    }

    .layout-nav {
        display: flex;
        flex: 1;
        justify-content: flex-end;
    }

    .layout-assistant {
        width: 300px;
        margin: 0 auto;
        height: inherit;
    }

    .layout-breadcrumb {
        padding: 10px 15px 0;
    }

    .layout-content {
        min-height: 200px;
        margin: 15px;
        overflow: hidden;
        background: #fff;
        border-radius: 4px;
    }

    .layout-content-main {
        padding: 10px;
    }

    .layout-copy {
        text-align: center;
        padding: 10px 0 20px;
        color: #9ea7b4;
    }

    .ivu-menu-horizontal.ivu-menu-light:after {
        height: 0;
    }

    .avatar {

    }

    /*********menu********/
    header {
        /*border-bottom: 1px solid red;*/
    }

    .ul-bar {
        display: flex;
        flex: 1;
    }

    nav {
        width: 100%;
        margin: 0 auto;
        padding: 0 20px;
    }
</style>
<template>
    <header>
        <nav>
            <Menu mode="horizontal" class="ul-bar" active-name="1" @on-select="goRouter">
                <div class="layout-logo"></div>
                <strong style="padding-top: 4px;font-size: 32px;">beike.io</strong>
                <div class="layout-nav clear">
                    <MenuItem name="home">
                        <Icon type="ios-navigate"></Icon>
                        首页
                    </MenuItem>
                    <!--<MenuItem name="canvas">-->
                        <!--<Icon type="ios-navigate"></Icon>-->
                        <!--canvas-->
                    <!--</MenuItem>-->
                    <!--<MenuItem name="about">-->
                        <!--<Icon type="ios-keypad"></Icon>-->
                        <!--about-->
                    <!--</MenuItem>-->
                    <!--<MenuItem name="register">-->
                        <!--<Icon type="ios-paper"></Icon>-->
                        <!--register-->
                    <!--</MenuItem>-->
                    <!--todo-->
                    <Submenu name="avatar" v-if="$store.state.userInfo.nick">
                        <template slot="title">
                            <Badge count="1">
                                <Avatar icon="person"></Avatar>
                            </Badge>
                        </template>
                        <MenuItem :name="$store.state.userInfo.nick">{{$store.state.userInfo.nick}}</MenuItem>
                        <MenuItem name="settings">设置</MenuItem>
                        <MenuItem name="writing">写文章</MenuItem>
                        <MenuItem name="logout">退出登录</MenuItem>
                    </Submenu>
                </div>
            </Menu>
        </nav>
    </header>
</template>
<script>
  export default {
    name: 'v-header',
    components: {},
    data () {
      return {
        msg: 'Hello world Header VueJS',
        userInfo: {
          id: '',
          username: '',
          nick: '',
          email: ''
        },
        project: 'default'
      }
    },
    created () {
      this.getUserInfo()
    },
    mounted () {
    },
    methods: {

      /**
       * @desc 获取用户信息
       * */
      getUserInfo () {
        this.$ajax.get('/api/user')
          .then(res => {
            console.info(res)
            if (res.errorCode === 0) {
              this.$store.commit('USER_INFO', res.data)
            }
          })
          .catch(err => {
            console.info(err)
          })
      },
      goRouter (name) {
        switch (name) {
          case 'logout':
            this.logout()
            break
          default:
            this.goPage(name)
        }
      },
      /**
       * @desc header menu 路由跳转
       * */
      goPage (url) {
        if (url === 'home') {
          this.$router.push('/')
        } else {
          this.$router.push('/' + url)
        }
      },
      logout () {
        this.$ajax.post('/api/logout')
          .then(res => {
            if (res.errorCode === 0) {
              this.$Message.success(res.msg)
              this.$router.push('/login')
            }
          })
          .catch(err => {
            console.info(err)
          })
      }
    }
  }
</script>
<style lang="scss" scoped>

</style>
