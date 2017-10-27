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
            <Input v-model="login" placeholder="请输入..."></Input>
          </FormItem>
          <FormItem label="password">
            <Input v-model="password" placeholder="password"></Input>
          </FormItem>
          <br>
          <Button type="primary">Login</Button>
        </Form>
        </Col>
      </Row>
    </div>
  </section>
</template>
<script>
  export default {
    name: 'login',
    components: {},
    data () {
      return {
        formItem: {},
        msg: 'Hello world login VueJS',
        login: 'login',
        password: 'password'
      }
    },
    methods: {}
  }
</script>
<style lang="scss" scoped>

</style>
