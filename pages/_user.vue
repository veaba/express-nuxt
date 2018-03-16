<!--
@desc 显示不及时的问题
-->
<template>
    <article>
      <section class="view-section user-section">
         <div class="person">
             <div class="banner"></div>
             <div class="avatar">
                 <Icon type="person" size="100"></Icon>
             </div>
             <div class="profile">
                <div class="profile-info">
                    <strong>{{userInfo.nick}}</strong>
                </div>
             </div>
         </div>
          <div class="detail"></div>
      </section>
    </article>
</template>

<script>
  export default {
    name: 'v-user',
    data () {
      return {
        keyword: '',
        userInfo: {}, // 用户信息
        isFind: true

      }
    },
    created () {
      console.info(this.$route.params.user)
      this.keyword = this.$route.params.user
      // TODO 去查询 该路由表存不存在
      // TODO * 被禁路由库
      // TODO * 用户路由库
      this.getRouter(this.keyword)
    },
    mounted () {
      // todo 频繁localStorage is not defined
      if (localStorage.userInfo.length > 0) {
        this.userInfo = JSON.parse(localStorage.userInfo)
      } else {
        // TODO
        alert('error 没找到用户')
      }
    },
    methods: {
      /**
       * @desc 找该路由，有结果则返回用户数据
       * */
      getRouter (router) {
        this.$ajax.get('/api/router', {
          params: {
            router: router
          }
        })
          .then(res => {
            this.isFind = res.errorCode === 0
          })
          .catch(err => {
            console.detail(err)
          })
      }
    }
  }
</script>

<style scoped lang="scss">
    .user-section{
        /*background: #fff;*/
    }
    .person{
        position: relative;
        height: 300px;
        .banner{
            width: 100%;
            height: 200px;
            border-top-left-radius: 2px;
            border-top-right-radius: 2px;
            background: linear-gradient(to right bottom, rgb(53, 73, 94), rgb(79, 192, 141));

        }
        .avatar{
            position: absolute;
            background: rgb(255, 255, 255);
            width: 110px;
            height: 110px;
            border-radius: 50%;
            overflow: hidden;
            padding: 5px;
            transform: translate(-50%, 0%);
            left: 50%;
            top: 50%;
            text-align: center;
            border: 4px solid rgba(84, 153, 118, 0.4);
            z-index: 10;
        }

        .profile{
            height: 100px;
            background: #fff;
            .profile-info{
                width: 400px;
                height: 100%;
                margin: 0 auto;
                text-align: center;
                padding: 61px;
                font-weight: bold;
                font-size: 16px;
            }
        }
    }
    .detail{
        display: flex;
        flex: 1;
        flex-direction: column;
        height: 100%;
        margin-top: 10px;
        background: #fff;
    }

</style>