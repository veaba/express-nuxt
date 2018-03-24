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
                        <p>骑乘龙首的蝼蚁传说，长生不死的武林神话！</p>
                    </div>
                </div>
            </div>
            <div class="detail">
                <Row>
                    <i-col span="18">
                        <div class="content">
                            <div class="column">
                                <div class="tabs">
                                    <div class="tabs-item">文章</div>
                                </div>
                                <div class="content-article" v-show="tabName==='article'">
                                    <div class="article-view" v-for="item of articleLists" :key="item._id">
                                        <div class="view-item">
                                            <div class="view-title">{{item.title}}</div>
                                            <div class="view-content">
                                                <div class="thread_text">{{item.abstract}}</div>
                                                <div class="thread_time">{{item.createdTime}}</div>
                                            </div>
                                        </div>
                                        <!--<div class="view-sidebar">-->
                                            <!--{{item.createdTime}}-->
                                        <!--</div>-->

                                    </div>
                                </div>
                                <!--<div class="content-comment" v-show="tabName==='comment'">回复回复</div>-->
                            </div>
                        </div>
                    </i-col>
                    <i-col span="6" style="padding-left: 10px;">
                        <div class="sidebar">
                            <div class="total-sidebar">
                                <div class="total-item">
                                    <div class="icon-item"><Icon type="person" size="48">作品数目</Icon></div>
                                    <strong>7</strong>
                                </div>
                                <div class="total-item">
                                    <div class="icon-item"><Icon type="headphone" color="#fff" size="48">作品数目</Icon></div>
                                    <strong>7</strong>
                                </div>
                                <div class="total-item">
                                    <div class="icon-item"><Icon type="cube" size="48">作品数目</Icon></div>
                                    <strong>7</strong>
                                </div>
                            </div>
                        </div>
                    </i-col>
                </Row>
            </div>
        </section>
    </article>
</template>

<script>
  export default {
    meta: {
      page: 'user'
    },
    name: 'v-user',
    data () {
      return {
        keyword: '',
        userInfo: {}, // 用户信息
        isFind: true,
        name1: '',
        tabName: 'article'
      }
    },
    computed: {
      articleLists: function () {
        let data = this.$store.state.articleList
        return data || []
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
      if (localStorage.userInfo && localStorage.userInfo.length) {
        this.userInfo = JSON.parse(localStorage.userInfo)
      } else {
        // TODO
        // alert('error 没找到用户')
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
    $color1:#eadca6;
    $color2:#c56d69;
    .user-section {
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
            bottom: 20px;
            text-align: center;
            border: 4px solid rgba(84, 153, 118, 0.4);
            z-index: 10;
        }

        .profile {
            height: 70px;
            background: #f7f7f7;
            .profile-info {
                width: 100%;
                height: 100%;
                padding-left: 140px;
                padding-top: 10px;
                strong{
                    font-weight: bold;
                    font-size: 18px;
                }
                p{
                    font-size: 13px;
                }
            }
        }
    }

    .detail {
        height: 100%;
        border-top: 1px solid #f6f5f0;
        .content {
            background: #fff;
        }
        .sidebar {
            /*background: #fff;*/
            padding-top: 20px;
            /*background: #f6f5f0;*/
            .total-sidebar{
                display: flex;
                .total-item{
                    text-align: center;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    .icon-item{
                        display: flex;
                        flex: 1;
                        align-items: center;
                        justify-content: center;
                        width: 64px;
                        height: 64px;
                        background: red;
                        border-radius: 50%;

                    }
                    &:nth-child(odd) .icon-item{
                        background: $color1;
                    }
                    &:nth-child(even) .icon-item{
                        background: $color2;
                    }

                    strong{
                        display: block;
                        font-size: 18px;
                    }
                }
                &:after{
                    display: block;
                    content: '';
                    clear: both;
                    width: 0;
                    height: 0;
                }
            }
        }
    }
    .content {
      .column{
          .tabs{
              border-bottom: 1px solid #dddee1;
              .tabs-item{
                  height: 48px;
                  color: #2b85e4;
                  line-height: 48px;
                  font-size: 18px;
                  border-bottom: 1px solid #2b85e4;
                  display: inline-block;
                  margin-bottom: -1px;
                  box-sizing: border-box;
                  letter-spacing: 1em;
              }
          }
          /*height: 48px;*/
          .content-article{
              display: flex;
              flex: 1;
              flex-direction: column;
              height: 100%;
              background: #fff;
              .article-view{
                  display: flex;
                  justify-content:space-between;
                  padding: 0 10px 10px;
                  .view-item{
                      flex: 1;
                      overflow: hidden;
                     .view-title{
                         font-size: 16px;
                         font-weight: bold;
                         flex: 1;
                         white-space: nowrap;
                         text-overflow: ellipsis;
                         overflow: hidden;
                         color: #2b85e4;
                         padding-top: 5px;
                         padding-right: 11em;
                     }
                      .view-content{
                          font-size: 13px;
                          display: flex;
                          justify-content:space-between;
                          .thread_text{
                              flex: 1;
                              padding-right: 2em;
                              white-space: nowrap;
                              text-overflow: ellipsis;
                              overflow: hidden;
                          }
                          .thread_time{
                              flex-basis: 150px;
                              text-align: right;
                          }

                      }
                  }

                  &+.article-view{
                      padding-top: 10px;
                      border-top: 1px dotted #ddd;
                  }
              }
          }
      }
    }

    .sidebar {

    }



</style>