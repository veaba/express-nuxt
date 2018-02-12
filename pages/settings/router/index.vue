<!------------------------
 *@name Vue.js
 *@author Jo.gel
 *@date 2018/2/6
 *warning :gutter 的用法不熟悉
 -------------------------->
<template>
    <div class="router-list">
        <Row type="flex" justity="end" :gutter="8" class="m-bottom-10">
            <i-col span="18"></i-col>

            <i-col span="6">
                <Input v-model="search_router" icon="search" @on-click="onClickRouter"
                       @on-enter="onEnterRouter"></Input>
            </i-col>
        </Row>
        <Row>
            <i-col span="24">
                <Table :data="routerData" :columns="routerCol"></Table>
            </i-col>
        </Row>
    </div>
</template>
<script>
  export default {
    name: 'routerList',
    layout: 'console',
    components: {},
    data () {
      return {
        search_router: '',
        msg: 'Hello world router VueJS',
        routerData: [
          {name: 'about', status: 1, type: 'official'},
          {name: 'home', status: 1, type: 'official'},
          {name: 'microsoft', status: 2, type: 'brand'},
          {name: 'google', status: 2, type: 'brand'},
          {name: 'settings', status: 1, type: 'official'},
          {name: '', status: 0, type: 'official'}
        ],
        routerCol: [
          {
            title: '名称',
            key: 'name'
          },
          {
            title: '状态',
            key: 'status',
            render: (h, params) => {
              let status = params.row.status === 1 ? '已注册的词汇' : (params.row.status === 2 ? '保留的词汇' : '被解禁后可注册的词汇')
              return h('div', status)
            }
          },
          {
            title: '类别',
            key: 'type'
          }
        ]
      }
    },
    methods: {
      onClickRouter () {
        console.info('点击icon search')
      },
      onEnterRouter () {
        console.info('回车 search')
      }
    }
  }
</script>
<style lang="scss" scoped>
    .router-list {
    }
</style>
