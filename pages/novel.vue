<!------------------------
 *@name Vue.js
 *@author Jo.gel
 *@date 2018/4/20
 *@desc 网络小说下载
 -------------------------->
<template>
    <section class="container">
        <div class="send-socket">
            <Button type="ghost" @click="sendSome">发送一段文字</Button>
        </div>
        <!--Input-->
        <div class="novel">
            <div class="input-body">
                <Input v-model="keyword" size="large" icon="search" placeholder="查找的小说" @on-enter="getNovel"
                       @on-click="getNovel"></Input>
            </div>
            <Button style="margin-top: 20px;" @click="onClearNovel" type="ghost" size="small">手动清空任务栈</Button>
        </div>
        <!--progress-->
        <Progress :percent="percent" :status="progressStatus"></Progress>
        <!--table-->
        <Table :loading="loading" :data="novelData" :columns="novelColumns"></Table>
        <Row class="pageBox" type="flex" justify="end">
            <Page :total="pageData.totals" :current.sync="pageData.page" show-total on-change @on-change="changeFlipPage"></Page>
        </Row>
    </section>
</template>
<script>
  /* eslint-disable handle-callback-err */
  // todo 下载任务完成后，会通过webSocket通知客户端。
  export default {
    name: 'novel',
    components: {},
    data () {
      return {
        keyword: '纯阳武神',
        loading: false,
        progressStatus: 'active',
        percent: 0, // 进度条
        newNovelDownload: false, // 新小说下载状态，用于冲掉notify
        // cancelNovelDownload: false, // 已有小说下载装填，用于冲掉notify
        novelData: [],
        pageData: {
          page: 1,
          totals: 1
        },
        novelColumns: [
          {
            title: '序号',
            type: 'index',
            sortable: true
          },
          {
            title: 'uuid',
            key: 'uuid',
            sortable: true
          },
          {
            title: '小说',
            key: 'name'
          },
          {
            title: '章节名称',
            key: 'title'
          },
          {
            title: '内容预览',
            width: 360,
            key: 'preview'
          },
          {
            title: '字数',
            key: 'length',
            sortable: true
          },
          {
            title: '是否超时',
            sortable: true,
            render: (h, params) => {
              return h('span', params.row.timeout ? '是' : '-')
            }
          }
        ]
      }
    },
    mounted () {
      this.receive() // 接收socket 的消息
      this.changeFlipPage()// 获取列表
    },
    methods: {
      /**
       * @desc 翻页
       * */
      changeFlipPage () {
        this.$ajax.get('/api/novel/getNovelList', {
          params: {
            keyword: this.keyword,
            page: this.pageData.page
          }
        })
          .then(res => {
            if (res.errorCode === 0) {
              this.novelData = res.data || []
              this.pageData.totals = res.totals || 1
            } else {
              this.novelData = []
            }
          })
          .catch(err => {
            console.info(err)
            this.pageData.totals = err.totals || 1
          })
      },
      /**
       * @desc setProgress
       * */
      setProgress () {
        this.percent = 0
        let setTime = setInterval(() => {
          // 进行中的话，++，但最大99
          if (this.percent < 99) {
            this.percent++
          }
          // 回来的话，设置为100，并清空定时器
          if (this.percent > 98 && this.percent < 100) {
            this.percent = 99
            clearInterval(setTime)
            return false
          }
          if (this.percent === 100) {
            clearInterval(setTime)
            return false
          }
          console.log(this.percent)
        }, 1000)
      },
      // 发送消息 client -> server
      sendSome () {
        this.$socket.emit('receive', { params: '客户端发给你的一段消息' })
      },
      // 接收消息 server -> client
      receive () {
        this.$socket.on('isConnectSocketStatus', data => {
          console.info(data)
        })
        /**
         * @desc 小说下载完成通知消息
         * @todo 成功数计算错误
         * */
        this.$socket.on('novel', json => {
          if (json.errorCode === 0) {
            this.loading = false
            // 如果本卡有上一次通知，则在开始后，4.5s关闭本卡
            this.$Notice.success({
              duration: 0,
              title: json.msg || '',
              render: h => {
                return h('div', [
                  h('p', [
                    '下载地址：',
                    h(
                      'a',
                      {
                        attrs: {
                          href: json['data']['url']
                        }
                      },
                      json.data.name
                    )
                  ]),
                  h('p', '开始时间：' + json.data.startTime || ''),
                  h('p', '结束时间：' + json.data.endTime || ''),
                  h('p', '耗时(s)：' + json.data.timeConsuming || ''),
                  h('p', '总章节：' + json.data.count || ''),
                  h(
                    'p',
                    '成功章节：' +
                    Number(json.data.count - json.data.failureTotal)
                  ),
                  h('p', '失败章节：' + json.data.failureTotal || '')
                ])
              }
            })
            this.newNovelDownload = true // 标志位，会冲掉上一次小说设置
          }
        })
        /**
         * @desc 小说下载的结果
         * */
        this.$socket.on('novelData', json => {
          console.info(json)
          if (json.errorCode === 0) {
            this.novelData = json.data || []
            this.pageData.total = json.data.totals || 1
          }
          this.loading = false
          this.percent = 100
        })

        /**
         * @desc 大兄弟，任务失败了
         * */
        this.$socket.on('missionFail', json => {
          console.info(json)
          if (json.errorCode) {
            this.percent = 100
            this.$Notice.warning({
              title: '任务失败',
              desc: json.msg || 'error'
            })
          }
          this.progressStatus = 'wrong'
        })
        this.$socket.on('receive1', data => {
          console.info(data)
        })
      },
      /**
       * @desc 手动清空任务栈
       * */
      onClearNovel () {
        this.$ajax
          .post('/api/novel/clearNovel')
          .then(res => {
            if (res.errorCode === 0) {
              this.$Notice.success({
                title: '任务成功',
                desc: res.msg || 'success'
              })
            } else {
              this.$Notice.warning({
                title: '任务失败',
                desc: res.msg || 'error'
              })
            }
          })
          .catch(err => {
            console.info(err)
          })
      },
      /**
       * @desc 获取小说
       * */
      getNovel () {
        if (!this.keyword) {
          this.$Message.error('尚未输入小说名')
          return false
        }
        this.$Notice.close('novelNotify') // 移除通知卡
        this.$ajax
          .get('/api/novel/getNovel', {
            params: {
              keyword: this.keyword
            }
          })
          .then(res => {
            console.info(res)
            this.loading = false
            this.novelData = []
            if (res.errorCode === 0) {
              // 开始执行进度条
              this.setProgress() // 设置进度条
              this.$Notice.success({
                title: res.data.start + '开始处理',
                desc: res.msg
              })
            } else {
              // 已有任务，警告
              this.$Notice.warning({
                title: res.msg || '',
                desc: res.data || []
              })
            }
          })
          .catch(err => {
            this.$Notice.error({
              title: '无法处理你的请求',
              desc: err.msg
            })
          })
      }
    }
  }
</script>
<style lang="scss" scoped>
    .novel {
        .input-body {
            height: 100%;
            margin-top: 10%;
        }
    }
    
    .novel {
        width: 650px;
        margin: 0 auto 100px;
    }
    
    @media screen and (max-width: 767px) {
        .novel {
            width: 80%;
            min-width: 320px;
            margin: 0 auto;
        }
    }
</style>
