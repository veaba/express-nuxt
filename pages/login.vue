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
        <Col>
        <Form :model="formItem" :label-width="80">
          <FormItem label="username">
            <Input v-model="username" placeholder="请输入..."></Input>
          </FormItem>
          <FormItem label="password">
            <Input v-model="password" placeholder="password"></Input>
          </FormItem>
          <br>
          <Button type="primary"  @click="loginEvent" style="width: 100%">Login</Button>
        </Form>
        </Col>
      </Row>
    </div>
  </section>
</template>
<script>
  /* eslint-disable space-in-parens,handle-callback-err */

  export default {
    name: 'login',
    components: {},
    data () {
      return {
        formItem: {},
        msg: 'Hello world login VueJS',
        username: 'username',
        password: 'password'
      }
    },
    methods: {
      loginEvent () {
        this.$ajax.post('/api/login', {
          username: this.username,
          password: this.password
        })
          .then(res => {

          })
          .catch(err => {

          })
      }
    }
  }
</script>
<style lang="scss" scoped>

</style>
