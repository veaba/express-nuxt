<!--------------------------
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
                <i-input v-model="keyword" size="large" icon="search" placeholder="查找的小说">
                  <Select v-model="selectType" slot="append" style="width: 70px">
                    <Option value="default">默认</Option>
                    <Option value="customer">自定义</Option>
                  </Select>
                </i-input>
              <!--todo 暂时未开发，后续开发一个对目录直接撸的，不走起点-->
              <Input v-if="selectType==='customer'" v-model="customerUrl" size="large" icon="network" placeholder="请输入小说的目录URL" style="margin-top: 20px;"></Input>
            </div>
            <Button style="margin-top: 20px;" @click="getNovel" type="primary" long>执行任务</Button>
          <ButtonGroup style="margin-top: 20px;">
            <Button @click="onClearNovel" type="ghost" size="small">
              <Icon type="trash-a"></Icon>
              手动清空任务栈</Button>
            <Button @click="changeFlipPage" type="ghost" size="small">
              <Icon type="search"></Icon>
              查询该小说</Button>
            <Button @click="novelTesting" type="ghost" size="small">
              <Icon type="information-circled"></Icon>
              临时测试</Button>
          </ButtonGroup>
          <Row style="margin-top: 20px;">
          	<i-col span="6">
              <Select v-model="pageData.isVip">
                <Option :value="1">vip</Option>
                <Option :value="0">普通</Option>
              </Select>
          	</i-col>
            <i-col span="6">
              <Select v-model="pageData.hasContent">
                <Option :value="1">成功的章节</Option>
                <Option :value="0">失败的章节</Option>
              </Select>
            </i-col>
          </Row>
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
      keyword: '官榜',
      loading: false,
      selectType: 'customer', // default走起点、customer，自定义
      customerUrl: 'http://www.shuge.net/html/2/2779/', // 自定义的url目录 //全职武神 (4) http://www.shuge.net/html/2/2779/ http://www.mianhuatang.la/23/23460/
      progressStatus: 'active',
      percent: 0, // 进度条
      newNovelDownload: false, // 新小说下载状态，用于冲掉notify
      // cancelNovelDownload: false, // 已有小说下载装填，用于冲掉notify
      novelData: [],
      pageData: {
        page: 1,
        totals: 1,
        isVip: '', // 1 vip 0 普通
        hasContent: '' // 有内容
      },
      novelColumns: [
        {
          title: '序号',
          type: 'index',
          sortable: true,
          width: 80
        },
        {
          title: 'uuid',
          key: 'uuid',
          sortable: true,
          width: 80
        },
        {
          title: '是否抓取成功',
          key: 'hasContent',
          width: 110,
          render: (h, params) => {
            return h('span', params.row.hasContent ? '成功' : '失败')
          }
        },
        {
          title: '类型',
          key: 'isVip',
          width: 80,
          render: (h, params) => {
            return h('span', params.row.isVip ? 'vip' : '普通')
          }
        },
        {
          title: '小说',
          width: 120,
          key: 'name'
        },
        {
          title: '章节名称',
          width: 200,
          key: 'title'
        },
        {
          title: '字数',
          key: 'length',
          width: 100,
          sortable: true
        },
        {
          title: '是否超时',
          width: 100,
          sortable: true,
          render: (h, params) => {
            return h('span', params.row.timeout ? '是' : '-')
          }
        },
        {
          title: '内容预览',
          minWidth: 480,
          ellipsis: true,
          key: 'preview',
          render: (h, params) => {
            return h('span', params.row.preview.trim())
          }
        }
      ]
    }
  },
  mounted () {
    this.receive() // 接收socket 的消息
    this.changeFlipPage() // 获取列表
  },
  methods: {
    /**
     * @desc 临时测试
     * */
    novelTesting () {
      console.info(11)
      this.$ajax.get('/api/novel/novelTesting')
        .then(res => {
          console.info(res)
        })
        .catch(err => {
          console.info(err)
        })
    },
    /**
     * @desc 翻页
     * */
    changeFlipPage () {
      this.loading = true
      this.$ajax
        .get('/api/novel/getNovelList', {
          params: {
            keyword: this.keyword,
            page: this.pageData.page,
            isVip: this.pageData.isVip,
            hasContent: this.pageData.hasContent // '' 全部 1-有内容 0-没内容
          }
        })
        .then(res => {
          this.loading = false
          if (res.errorCode === 0) {
            this.novelData = res.data || []
            this.pageData.totals = res.totals || 1
          } else {
            this.novelData = []
          }
        })
        .catch(err => {
          console.info(err)
          this.loading = false
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
          // 最新的话，进度条完成
          if (json.data.eventType === 'latest') {
            this.percent = 100
          }
          console.info(json);
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
                        // todo 返回比较慢，后续才会生成txt文件
                        href: location.origin + json['data']['url'],
                        download: json['data'].name + '.txt'
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
          this.pageData.totals = json.totals || 1
          this.pageData.page = json.pageCurrent || 1
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
            this.progressStatus = 'wrong'
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
      if (this.selectType === 'customer' && !this.customerUrl) {
        this.$Message.error('请输入爬取目标小说目录所在的url')
        return false
      }
      this.$Notice.close('novelNotify') // 移除通知卡
      if (this.selectType === 'default') {
        // 起点爬取部分
        this.qiQianNovel()
      } else {
        // 自定义爬取部分
        this.customerNovel()
      }
    },
    /**
     * @desc 起点爬取部分
     * */
    qiQianNovel () {
      this.loading = true
      this.$ajax.get('/api/novel/getNovel', {
        params: {
          keyword: this.keyword.trim()
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
    },
    /**
     * @desc 负责通知而已
     * */
    customerNovel () {
      this.loading = true
      this.setProgress() // 设置进度条
      this.$ajax.post('/api/novel/customizedNovel', {
        url: this.customerUrl,
        keyword: this.keyword.trim()
      })
        .then(res => {
          console.info(res)
          this.loading = false
          if (res.errorCode === 0) {
            this.percent = 100
            this.$Notice.success({
              duration: 0,
              title: res.msg || '',
              render: h => {
                return h('div', [
                  h('p', [
                    '下载地址：',
                    h(
                      'a',
                      {
                        attrs: {
                          href: location.origin + res['data']['url'],
                          download: res['data'].name + '.txt'
                        }
                      },
                      res.data.name
                    )
                  ]),
                  h('p', '开始时间：' + res.data.startTime || ''),
                  h('p', '结束时间：' + res.data.endTime || ''),
                  h('p', '耗时(s)：' + res.data.timeConsuming || ''),
                  h('p', '总章节：' + res.data.count || ''),
                  h(
                    'p',
                    '成功章节：' +
                    Number(res.data.count - res.data.failureTotal)
                  ),
                  h('p', '失败章节：' + res.data.failureTotal || '')
                ])
              }
            })
          } else {
            this.percent = 100
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
          this.pageData.totals = 1
          this.pageData.page = 1
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
