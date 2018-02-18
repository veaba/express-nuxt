<!------------------------
 *@name Vue.js
 *@author Jo.gel
 *@date 2018/2/6
 *warning :gutter 的用法不熟悉
 -------------------------->
<template>
    <div class="router-list">
        <Row type="flex" justity="end" :gutter="8" class="m-bottom-10 p-top-20">
            <i-col span="18">
                <Button type="primary" @click="onAddRouterModal"> 添加路由</Button>
            </i-col>

            <i-col span="6">
                <Input v-model="search_router" icon="search" @on-click="onSearchRouter"
                       @on-enter="onSearchRouter"></Input>
            </i-col>
        </Row>
        <Row>
            <i-col span="24">
                <Table :data="routerData" :columns="routerCol"></Table>
            </i-col>
        </Row>

        <Modal v-model="addRouterStatus" width="900" @on-ok="onAddRouter">
            <p slot="header">添加路由</p>
            <Row>
                <i-col span="21">
                    <Form v-model="routerItem" :label-width="120">
                        <Form-item :label="'路由名称'" required>
                            <i-Input v-model="routerItem.name"></i-Input>
                        </Form-item>
                        ,
                        <Form-item :label="'路由状态'" required>
                            <i-select v-model="routerItem.status">
                                <Option v-for="(item,index) in routerStatusList" :value="item" :key="index">{{item}}
                                </Option>
                            </i-select>
                        </Form-item>
                        ,
                        <Form-item :label="'路由类别'" required>
                            <i-select v-model="routerItem.type">
                                <Option v-for="(item,index) in routerTypeList" :value="item" :key="index">{{item}}
                                </Option>
                            </i-select>
                        </Form-item>
                    </Form>
                </i-col>
            </Row>
        </Modal>
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
        routerData: [],
        routerCol: [
          {
            title: '名称',
            key: 'name'
          },
          {
            title: '状态',
            key: 'status'
          },
          {
            title: '类别',
            key: 'type'
          },
          {
            title: '操作',
            key: 'actions',
            render: (h, parmas) => {
              return h('Button', {
                props: {
                  type: 'ghost'
                },
                on: {
                  click: () => {
                    this.deleteRouter(parmas.row.name)
                  }
                }
              }, '删除')
            }
          }
        ],
        addRouterStatus: false,
        // 0、原来属于（1、2）类的词汇——被解禁的词汇
        // 1、已注册的路由词汇——站方路由，用户
        // 2、保留的路由词汇——品牌词汇、特殊、国家、组织 **
        routerStatusList: ['ban', 'normal', 'keep'], // 后期由前端维护
        routerTypeList: ['official', 'brand', 'user', 'org'], // 后期由前端维护
        routerItem: {
          name: '',
          status: 'keep',
          type: 'brand'
        }
      }
    },
    created () {
      this.getRouterAPI()
    },
    methods: {
      onSearchRouter () {
        this.getRouterAPI()
      },
      /**
       * @desc api
       * */
      getRouterAPI () {
        this.$ajax.get('/api/getRouterList')
          .then(res => {
            if (res.errorCode === 0) {
              this.routerData = res.data
            } else {
              this.routerData = []
            }
          })
          .catch(err => {
            console.info(err)
          })
      },
      onAddRouterModal () {
        this.addRouterStatus = true
      },
      /**
       * @desc 添加路由
       * */
      onAddRouter () {
        this.$ajax.post('/api/addRouter', this.routerItem)
          .then(res => {
            if (res.errorCode === 0) {
              this.getRouterAPI()// 刷新
            } else {
              this.$Message.error(res.msg || '后台错误')
            }
          })
          .catch(err => {
            this.$Message.error(err.msg || '服务端错误')
          })
      },
      /**
       * @desc 删除路由
       * */
      deleteRouter (name) {
        console.info(name)
        this.$ajax.post('/api/deleteRouter', {name: name})
          .then(res => {
            if (res.errorCode === 0) {
              this.getRouterAPI()// 刷新
            } else {
              this.$Message.error(res.msg || '后台错误')
            }
          })
          .catch(err => {
            this.$Message.error(err.msg || '服务端错误')
          })
      }
    }
  }
</script>
<style lang="scss" scoped>
    .router-list {
    }
</style>
