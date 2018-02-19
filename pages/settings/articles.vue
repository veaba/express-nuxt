<!------------------------
 *@name Vue.js settings-文章管理页面
 *@author Jo.gel
 *@date 2018/2/9
 -------------------------->
<template>
  <div class="article">

    <Row type="flex" justify="end" class="m-bottom-10 p-top-20">
      <i-col span="6">
        文章信息（共233条）
      </i-col>
      <i-col span="6" offset="12">
        <Input v-model="search" icon="search" @on-click="onSearchEnter" @on-enter="onSearchEnter"></Input>
      </i-col>
    </Row>

    <Table :data="articleData" :columns="articleCol"></Table>


  </div>
</template>
<script>
    export default {
      name: 'articles',
      components: {},
      data () {
        return {
          search: '标题1',
          msg: 'Hello world article VueJS',
          articleData: [],
          articleCol: [
            {
              title: '内容',
              key: 'post_title'
            },
            {
              title: '更新时间',
              key: 'post_date'
            },
            {
              title: '操作',
              key: 'actions',
              render: (h, parmas) => {
                return h('div', {}, [
                  h('Icon', {
                    props: {
                      size: 20,
                      type: 'ios-alarm-outline'
                    },
                    style: {
                      'margin-right': '5px'
                    }
                  }),
                  h('Icon', {
                    props: {
                      size: 20,
                      type: 'trash-a'
                    },
                    style: {
                      'margin-right': '5px'
                    }
                  }),
                  h('Icon', {
                    props: {
                      size: 20,
                      type: 'edit'
                    },
                    style: {
                      'margin-right': '5px'
                    }
                  }),
                  h('Icon', {
                    props: {
                      size: 20,
                      type: 'wrench'
                    },
                    style: {
                      'margin-right': '5px'
                    }
                  }),
                  h('Icon', {
                    props: {
                      size: 20,
                      type: 'thumbsup'
                    },
                    style: {
                      'margin-right': '5px'
                    }
                  }),
                  h('Icon', {
                    props: {
                      size: 20,
                      type: 'thumbsdown'
                    },
                    style: {
                      'margin-right': '5px'
                    }
                  }),
                  h('Icon', {
                    props: {
                      size: 20,
                      type: 'ios-chatboxes-outline'
                    },
                    style: {
                      'margin-right': '5px'
                    }
                  }),
                  h('Icon', {
                    props: {
                      size: 20,
                      type: 'ios-pulse-strong'
                    },
                    style: {
                      'margin-right': '5px'
                    }
                  }),
                  h('Icon', {
                    props: {
                      size: 20,
                      type: 'ios-eye'
                    },
                    style: {
                      'margin-right': '5px'
                    }
                  }),
                  h('Icon', {
                    props: {
                      size: 20,
                      type: 'ios-locked'
                    },
                    style: {
                      'margin-right': '5px'
                    }
                  }),
                  h('Icon', {
                    props: {
                      size: 20,
                      type: 'ios-person'
                    },
                    style: {
                      'margin-right': '5px'
                    }
                  })
                ])
              }
            }
          ]
        }
      },
      created () {
        this.getArticleAPI()
      },
      methods: {
        onSearchEnter () {
          console.info('11')
        },
        /**
         * @desc 拉取api
         * */
        getArticleAPI () {
          this.$ajax.get('/api/getArticleList', {name: this.search})
            .then(res => {
              if (res.errorCode === 0) {
                this.articleData = res.data
              } else {
                this.articleData = []
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
