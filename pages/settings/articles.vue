<!------------------------
 *@name Vue.js settings-文章管理页面
 *@author Jo.gel
 *@date 2018/2/9
 -------------------------->
<template>
    <div class="article">


        <Row type="flex" justify="end">
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
        articleData: [
          {content: '我是内容12饿额', time: '2018-2-9 15:22:24'},
          {content: '我是内容s123饿额', time: '2018-2-9 15:22:24'},
          {content: '我是内das容12饿额', time: '2018-2-9 15:22:24'},
          {content: '我是内ass容12饿额', time: '2018-2-9 15:22:24'},
          {content: '我是内容12ddds饿额', time: '2018-2-9 15:22:24'},
          {content: '我是sad内容12饿额', time: '2018-2-9 15:22:24'},
          {content: '我是内容12sad饿额', time: '2018-2-9 15:22:24'},
          {content: '我是内容12饿额', time: '2018-2-9 15:22:24'},
          {content: '我是sad内容12饿额', time: '2018-2-9 15:22:24'},
          {content: '我是内容c12饿sda额', time: '2018-2-9 15:22:24'},
          {content: '我是内s容12sa饿额', time: '2018-2-9 15:22:24'}
        ],
        articleCol: [
          {
            title: '内容',
            key: 'content'
          },
          {
            title: '更新时间',
            key: 'time'
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
    methods: {
      onSearchEnter () {
        console.info('11')
      }
    }
  }
</script>
<style lang="scss" scoped>

</style>
