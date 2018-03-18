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
            <div class="detail">
                <Row>
                    <i-col span="18">
                        <div class="content">
                            <div class="column">
                                <Tabs :animated="false" @on-click="getTabName">
                                    <TabPane label="全部" name="all"></TabPane>
                                    <TabPane label="文章" name="article"></TabPane>
                                    <TabPane label="回复" name="comment"></TabPane>
                                </Tabs>
                                <div class="content-all" v-show="tabName==='all'">全部全部全部</div>
                                <div class="content-article" v-show="tabName==='article'">文章文章</div>
                                <div class="content-comment" v-show="tabName==='comment'">回复回复</div>
                            </div>
                        </div>
                    </i-col>
                    <i-col span="6" style="padding-left: 10px;">
                        <div class="sidebar">sd</div>
                    </i-col>
                </Row>
            </div>
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
        isFind: true,
        name1: '',
        tabName: 'all'
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
       * @desc tab Name
       * */
      getTabName (name) {
        this.tabName = name
        console.info(name)
      },

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
    .user-section {
        /*background: #fff;*/
    }

    .person {
        position: relative;
        height: 300px;
        .banner {
            width: 100%;
            height: 200px;
            border-top-left-radius: 2px;
            border-top-right-radius: 2px;
            background: linear-gradient(to right bottom, rgb(53, 73, 94), rgb(79, 192, 141));

        }
        .avatar {
            position: absolute;
            background: rgb(255, 255, 255);
            width: 110px;
            height: 110px;
            border-radius: 4px;
            overflow: hidden;
            padding: 5px;
            left: 20px;
            top: 50%;
            text-align: center;
            border: 4px solid rgba(84, 153, 118, 0.4);
            z-index: 10;
        }

        .profile {
            height: 100px;
            background: #fff;
            .profile-info {
                width: 100%;
                height: 100%;
                padding-left: 140px;
                font-weight: bold;
                font-size: 18px;
                padding-top: 10px;
            }
        }
    }

    .detail {
        height: 100%;
        margin-top: 10px;
        .content {
            border: 1px solid green;
            background: #fff;
        }
        .sidebar {
            border: 1px solid red;
            background: #fff;
        }
    }
    .content {
      .column{
          height: 48px;
      }
    }

    .sidebar {

    }



</style>