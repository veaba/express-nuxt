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
     <Row class="pageBox" type="flex" justify="end">
         <Page :total="pageData.total" :current.sync="pageData.page" show-total on-change @on-change="getArticleListAPI"></Page>
     </Row>
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
              key: 'post_title',
              render: (h, params) => {
                return h('a', {
                  attrs: {
                    href: 'javascript:void(0)'
                  },
                  on: {
                    click: () => {
                      this.$router.push({path: '/article', query: {id: params.row._id}})
                    }
                  }

                }, params.row.post_title)
              }
            },
            {
              title: '更新时间',
              key: 'post_date'
            },
            {
              title: '操作',
              key: 'actions',
              render: (h, params) => {
                return h('a', {
                  attrs: {
                    href: 'javascript:void(0)'
                  },
                  on: {
                    click: () => {
                      this.$router.push({path: '/writing', query: {id: params.row._id}})
                    }
                  }

                }, '编辑')
              }
            }
          ],
          pageData: {
            page: 1,
            total: 1
          }
        }
      },
      created () {
        this.getArticleListAPI()
      },
      methods: {
        onSearchEnter () {
          console.info('11')
        },
        /**
         * @desc 拉取api
         * */
        getArticleListAPI () {
          this.$ajax.get('/api/getArticleList', {
            params: {
              name: this.search,
              page: this.pageData.page
            }
          })
            .then(res => {
              console.info(res)
              if (res.errorCode === 0) {
                this.articleData = res.data
                this.pageData.total = res.totals || 1
              } else {
                this.articleData = []
              }
            })
            .catch(err => {
              console.info(err)
              this.pageData.total = err.total || 1
            })
        }
      }
    }
</script>
<style lang="scss" scoped>

</style>
