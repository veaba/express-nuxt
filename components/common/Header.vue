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
        margin-right: 20px;
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

    }

    .ul-bar {
        display: flex;
        flex: 1;
    }

    nav {
        width: 1200px;
        margin: 0 auto;
    }
</style>
<template>
    <header>
        <nav>
            <Menu mode="horizontal" class="ul-bar" active-name="1" @on-select="goRouter">
                <div class="layout-logo"></div>
                <div class="layout-nav clear">
                    <MenuItem name="/">
                        <Icon type="ios-navigate"></Icon>
                        Home
                    </MenuItem>
                    <MenuItem name="about">
                        <Icon type="ios-keypad"></Icon>
                        about
                    </MenuItem>
                    <MenuItem name="register">
                        <Icon type="ios-paper"></Icon>
                        register
                    </MenuItem>
                    <Submenu name="avatar">
                        <template slot="title">
                            <Badge count="1">
                                <Avatar icon="person"></Avatar>
                            </Badge>
                        </template>
                        <MenuItem name="settings">设置</MenuItem>
                        <MenuItem name="logout">退出登录</MenuItem>
                    </Submenu>
                </div>
            </Menu>
        </nav>
    </header>
</template>
<script>
  export default {
    name: 'header',
    components: {},
    data () {
      return {
        msg: 'Hello world Header VueJS'
      }
    },
    methods: {
      goRouter (name) {
        switch (name) {
          case 'register':
            this.goPage(name)
            break
          case 'logout':
            this.logout()
            break
          default:
            this.goPage(name)
        }
      },
      goPage (url) {
        this.$router.push(url)
      },
      logout () {
        this.$ajax.post('/api/logout')
          .then(res => {
            if (res.errorCode === 0) {
              this.$Message.success(res.msg)
              this.$router.push('login')
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
