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
                    <Button type="primary" @click="loginEvent" style="width: 100%">Login</Button>
                    <br>
                    <br>
                    <Button type="ghost" @click="monGoTest" style="width: 100%">monGoTest</Button>
                    <br>
                    <br>
                    <Button type="ghost" @click="insertTest" style="width: 100%">插入测试 当前时间点</Button>
                    <br>
                    <br>
                    <Button type="ghost" @click="findTest" style="width: 100%">查询测试 2017</Button>
                    <br>
                    <br>
                    <Button type="ghost" @click="deleteTest" style="width: 100%">删除测试 当前时间点</Button>
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
        username: 'admin',
        password: 'admin'
      }
    },
    mounted () {
      console.info(this.socket)
    },
    methods: {
      /**
       * @desc login
       * */
      loginEvent () {
        this.$ajax.post('/api/login', {
          username: this.username,
          password: this.password
        })
          .then(res => {

          })
          .catch(err => {

          })
      },
      monGoTest () {
        this.$ajax.post('/api/mongoTest', {
          username: 'test',
          password: 'test2'
        })
          .then(res => {

          })
          .catch(err => {

          })
      },
      /**
       * @desc 插入测试
       * */
      insertTest () {
        this.$ajax.post('/api/insert', {
          username: 'insert',
          password: 'insert'
        })
          .then(res => {
            console.info(res)
          })
          .catch(err => {
            console.info(err)
          })
      },

      findTest () {
        this.$ajax.post('/api/find', {
          username: 'find',
          password: 'find'
        })
          .then(res => {
            console.info(res)
          })
          .catch(err => {
            console.info(err)
          })
      },

      deleteTest () {
        this.$ajax.post('/api/delete', {
          username: 'delete',
          password: 'delete'
        })
          .then(res => {
            console.info(res)
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
