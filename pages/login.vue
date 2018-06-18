<!------------------------
 *@name Vue.js
 *@author Jo.gel
 *@date 2017/10/26
 -------------------------->
<template>
    <section class="container">
        <h2>登录界面</h2>
        <div id="login" class="login">
            <Row>
                <i-col>
                <Form :model="formItem" :label-width="80">
                    <FormItem label="username">
                        <i-input v-model="username" placeholder="请输入..."></i-input>
                    </FormItem>
                    <FormItem label="password">
                        <i-input v-model="password" placeholder="password"></i-input>
                    </FormItem>
                    <br>
                    <Button type="primary" @click="login" style="width: 100%">Login</Button>
                    <br>
                    <br>
                    <Button type="error" @click="logout" style="width: 100%">logout</Button>
                    <br>
                    <br>
                    <Button type="ghost" @click="$store.commit('increment')" style="width: 100%">{{ $store.state.counter
                        }}
                    </Button>
                    <br>
                    <br>
                    <Button typo="error" @click="getTest">testError</Button>
                </Form>
                </i-col>
            </Row>
        </div>
    </section>
</template>
<script>
  /* eslint-disable space-in-parens,handle-callback-err */
  export default {
    name: 'login',
    layout: 'noHeader',
    components: {},
    data () {
      return {
        formItem: {},
        msg: 'Hello world login VueJS',
        username: 'admin',
        password: 'admin'
      }
    },
    created () {
    },
    mounted () {
    },
    methods: {

      getTest () {
        console.info(1)
      },
      /**
       * @desc login
       * */
      login () {
        this.$ajax.post('/api/login', {
          username: this.username,
          password: this.password
        })
          .then(res => {
            if (res.errorCode === 0) {
              // 1、登录成功之后，设置通行状态
              this.$store.commit('SET_AUTH', true)
              // 2、为store 下发用户信息
              this.$store.dispatch('getUserInfoAPI')
              // 3、跳转 -跳到来源地
              let path = ''
              this.$nextTick(() => {
                if (this.$route.query.ref) {
                  path = this.$route.query.ref.replace(/%2/, '/')
                }
                this.$router.push(path || this.$store.state.Referer || '/')
                // TODO 后续需要判断是不是在本域内的url
              })
            }
            if (res.errorCode === 1) {
              this.$Message.error(res.msg)
            }
          })
          .catch(err => {
            console.info(err)
          })
      },
      /**
       * @desc 异步判断是否写入用户信息才跳转页面,this 无效，
       * @desc nuXt 提供三种异步的方法
       * */
      asyncData () {
      },
      /**
       * @desc 退出
       * */
      logout () {
        this.$ajax.post('/api/logout', {
          isAuth: null
        })
          .then(res => {
            if (res.errorCode === 0) {
              this.$store.commit('SET_AUTH', null)
            } else {
              this.$Message.success('logout errorCode 不等于0')
            }
          })
          .catch(err => {
            console.info(err + '/api/logout')
          })
      }
    }
  }
</script>
<style lang="scss" scoped>

</style>
