<!--------------------------
 *@name Vue.js
 *@author Jo.gel
 *@date 2018/4/20
 *@desc 网络小说下载
 *@desc todo 严重，自定义下载，会污染全局。
 *@desc todo 区分dev 和生产环境下的的异同，然后给出不同的功能。
 *@desc todo 移动端iphone/ipad 无法支持blob 对象、download，导致无法下载文件
 * todo 下载任务完成后，会通过webSocket通知客户端。

 -------------------------->
<template>
    <section class="container">
        <!--Input-->
        <div class="novel">
          <!--progress-->
            <div class="input-body">
              <Progress :percent="percent" :status="progressStatus"></Progress>
              <i-input v-model="keyword" size="large" icon="search" placeholder="查找的小说">
                  <Select v-model="selectType" disabled slot="append" style="width: 70px">
                    <!--<Option value="default">默认</Option>-->
                    <Option value="customer" >自定义</Option>
                  </Select>
                </i-input>
              <!--todo 暂时未开发，后续开发一个对目录直接撸的，不走起点-->
              <Input v-if="selectType==='customer'" v-model="customerUrl" size="large" icon="network" placeholder="请输入小说的目录URL" style="margin-top: 20px;"></Input>
            </div>
            <Button style="margin-top: 20px;" @click="getNovel" :loading="loading" type="primary" long>执行任务</Button>
          <!--定制化-->
            <Button style="margin-top: 10px;" v-show="isDoneWebSocketCustomer||customerStatus" type="ghost" long>
            <Icon type="ios-cloud-download"></Icon>
            <span class="download" style="margin-left: 5px;"></span>
          </Button>

            <div class="btn-group">
              <ButtonGroup style="margin-top: 20px;">
                <Button @click="onClearNovel" type="ghost">
                  <Icon type="trash-a"></Icon>
                  手动清空任务栈</Button>
                <Button v-if="isDev" @click="novelTesting" type="ghost">
                  <Icon type="information-circled"></Icon>
                  临时测试</Button>
              </ButtonGroup>
          </div>

            <Card :bordered="false" :dis-hover="true">
              <p>- 需要输入小说名和网站目录地址成功后，会生成txt文件</p>
              <p>- 目录过长可能会丢失部分章节</p>
              <p>- iPhone/iPad等无法下载，请更换PC/Android</p>
              <p>- 如有问题，请联系<a href="https://weibo.com/Naruzi" target="_blank">@叶箫大人</a></p>
            </Card>
        </div>
    </section>
</template>
<script>
/* eslint-disable handle-callback-err */
import nuXtConfig from './../nuxt.config';
export default {
  name: 'novel',
  components: {},
  data () {
    return {
      keyword: '魔鬼',
      loading: false,
      selectType: 'customer', // default走起点、customer，自定义
      // http://www.23xs.cc/book/19/index.html 官榜
      // https://www.biduo.cc/biquge/44_44762/
      customerUrl: 'https://www.biduo.cc/biquge/44_44762/', // 自定义的url目录 //全职武神 (4) http://www.shuge.net/html/2/2779/ http://www.mianhuatang.la/23/23460/
      customerStatus: false,
      progressStatus: 'active',
      percent: 0, // 进度条
      newNovelDownload: false, // 新小说下载状态，用于冲掉notify
      disabledDownload: false, // 禁止再次执行下载任务
      webSocketCount: 0, // 下载时候，webSocket传递过来总章节
      webSocketCountData: [], // 每次webSocket 传递过来的index 长度
      novelTable: [],
      novelData: [], // 前端存储webSocket发送过来的小说数据，一条20条
      pageData: {
        page: 1,
        totals: 1,
        isVip: '', // 1 vip 0 普通
        hasContent: '' // 有内容
      },
      isDev: nuXtConfig.dev // 判断是否是开发环境下
    };
  },
  computed: {
    /**
     * @desc 判断是否通过webSocket完成数据传输的标志
     * @return true 完成 false 未完成
     * */
    isDoneWebSocketCustomer: function () {
      let countLength = this.webSocketCountData.length;
      let countCeil = this.webSocketCount;
      if (
        this.webSocketCount &&
        (countLength + 1 === countCeil || countLength === countCeil)
      ) {
        this.disabledDownload = false;
        return true;
      } else {
        return false;
      }
    },
    /**
     * @desc 计算小说数据并排序
     * @return 小说内容
     * @todo 后续需要过滤content 的正则匹配
     * */
    novelCustomerContent: function () {
      let arr = this.novelData.sort((item1, item2) => {
        return item1.index - item2.index;
      });
      let data = '';
      for (let item of arr) {
        data = data + item.title + this.formatNovelData(item.content) + '\n\n';
      }
      return data;
    }
  },
  mounted () {
    this.webSocketReceive(); // 接收socket 的消息
  },
  updated () {},
  methods: {
    // 接收消息 server -> client
    webSocketReceive () {
      this.$socket.on('isConnectSocketStatus', data => {
        console.info(data);
      });
      /**
       * @desc 小说下载完成通知消息
       * */
      this.$socket.on('novel', json => {
        if (json.errorCode === 0) {
          this.loading = false;
          // 最新的话，进度条完成
          if (json.data.eventType === 'latest') {
            this.percent = 100;
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
                  '成功章节：' + Number(json.data.count - json.data.failCount)
                ),
                h('p', '失败章节：' + json.data.failCount || '')
              ]);
            }
          });
          this.newNovelDownload = true; // 标志位，会冲掉上一次小说设置
        }
      });
      /**
       * @desc 小说下载的结果
       * */
      this.$socket.on('novelData', json => {
        console.info(json);
        if (json.errorCode === 0) {
          this.novelTable = json.data || [];
          this.pageData.totals = json.totals || 1;
          this.pageData.page = json.pageCurrent || 1;
        }
        this.loading = false;
        this.percent = 100;
      });

      /**
       * @desc 大兄弟，任务失败了
       * */
      this.$socket.on('missionFail', json => {
        console.info(json);
        if (json.errorCode) {
          this.percent = 100;
          this.$Notice.warning({
            title: '任务失败',
            desc: json.msg || 'error'
          });
        }
        this.progressStatus = 'wrong';
      });
      /*
      * @desc 通过多线程的数据库查询，让webSocket 传输数据
      * @todo 不知道webSocket / socket.io 有多少字节的限制
      * */
      this.$socket.on('download', json => {
        if (json.errorCode === 0) {
          this.webSocketCountData.push(json.index);
          this.novelData.push(...json.data);
        }
      });
      /**
       * @desc 下载结果通知
       * */
      this.$socket.on('downloadNotify', json => {
        if (json.errorCode === 0) {
          this.webSocketCount = json.count;
          this.$Notice.success({
            duration: 0,
            title: json.msg || '',
            render: h => {
              return h('div', [
                h('p', '开始时间：' + json.startTime || ''),
                h('p', '结束时间：' + json.endTime || ''),
                h('p', '耗时(s)：' + json.timeConsuming || ''),
                h('p', '总章节：' + json.count || ''),
                h('p', '成功章节：' + Number(json.count - json.failCount)),
                h('p', '失败章节：' + json.failCount || '')
              ]);
            }
          });
        }
      });
      /**
       * @desc 接受消息
       * */
      this.$socket.on('receive1', data => {
        console.info(data);
      });
    },
    /**
     * @desc 格式化排版
     * */
    formatNovelData (content) {
      /* eslint no-irregular-whitespace: ["error", { "skipRegExps": true }] */
      return content.replace(/    /g, '\n\n    ');
    },
    /**
     * @desc 前端下载小说
     * */
    downloadBook () {
      let blob = new Blob([this.novelCustomerContent], { type: 'text/plain' });
      let link = document.createElement('a');
      link.innerHTML = this.keyword + '.txt';
      link.href = window.URL.createObjectURL(blob);
      link.download = this.keyword + '.txt';
      this.$nextTick(() => {
        document.querySelector('.download').innerHTML = ''; // 清空上一个遗留
        if (document.querySelector('.download')) {
          console.info(document.querySelector('.download'));
          document.querySelector('.download').appendChild(link);
        }
      });
      console.info(link);
      return link;
    },
    /**
     * @desc1 执行下载任务，20条下载数据库的
     * @desc2 如果是定制化，直接爬取，不需要写入数据库下载
     * @desc3 否则的话，需要爬取并写入数据，才从数据库下载
     * */
    downloadNotify () {
      if (this.selectType === 'default') {
      } else {
        this.downloadCustomer();
      }
    },
    downloadCustomer () {
      this.customerNovel();
    },
    /**
     * @desc 临时测试
     * */
    novelTesting () {
      this.$ajax
        .get('/api/novel/novelTesting')
        .then(res => {
          console.info(res);
        })
        .catch(err => {
          console.info(err);
        });
    },
    /**
     * @desc setProgress
     * */
    setProgress () {
      this.percent = 0;
      let setTime = setInterval(() => {
        // 进行中的话，++，但最大99
        if (this.percent < 99) {
          this.percent++;
        }
        // 回来的话，设置为100，并清空定时器
        if (this.percent > 98 && this.percent < 100) {
          this.percent = 99;
          clearInterval(setTime);
          return false;
        }
        if (this.percent === 100) {
          clearInterval(setTime);
          return false;
        }
        console.log(this.percent);
      }, 1000);
    },
    // 发送消息 client -> server
    // sendSome () {
    //   this.$socket.emit('receive', { params: '客户端发给你的一段消息' })
    // },
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
            });
          } else {
            this.progressStatus = 'wrong';
            this.$Notice.warning({
              title: '任务失败',
              desc: res.msg || 'error'
            });
          }
        })
        .catch(err => {
          console.info(err);
        });
    },
    /**
     * @desc 获取小说
     * */
    getNovel () {
      if (!this.keyword) {
        this.$Message.error('尚未输入小说名');
        return false;
      }
      if (this.selectType === 'customer' && !this.customerUrl) {
        this.$Message.error('请输入爬取目标小说目录所在的url');
        return false;
      }
      this.$Notice.close('novelNotify'); // 移除通知卡
      if (this.selectType === 'default') {
        // 起点爬取部分
      } else {
        // 自定义爬取部分
        this.customerNovel();
      }
    },
    /**
     * @desc 负责通知而已
     * */
    customerNovel () {
      this.loading = true;
      this.setProgress(); // 设置进度条
      this.novelData = []; // 初始化
      this.webSocketCountData = []; // 初始化
      this.customerStatus = false;
      this.$ajax
        .post('/api/novel/customizedNovel', {
          url: this.customerUrl,
          keyword: this.keyword.trim()
        })
        .then(res => {
          console.info(res);
          this.loading = false;
          if (res.errorCode === 0) {
            this.webSocketCount = res.count; // 总章节
            this.percent = 100;
            this.customerStatus = true;
            this.downloadBook(); // 生成下载blob
            this.$Notice.success({
              duration: 0,
              title: res.msg || '',
              render: h => {
                return h('div', [
                  h('p', '开始时间：' + res.startTime || ''),
                  h('p', '结束时间：' + res.endTime || ''),
                  h('p', '耗时(s)：' + res.timeConsuming || ''),
                  h('p', '总章节：' + res.count || ''),
                  h('p', '成功章节：' + Number(res.count - res.failCount)),
                  h('p', '失败章节：' + res.failCount || '')
                ]);
              }
            });
          } else {
            this.customerStatus = false;
            this.percent = 100;
            // 已有任务，警告
            this.$Notice.warning({
              title: res.msg || '',
              desc: res.data || []
            });
          }
        })
        .catch(err => {
          this.customerStatus = false;
          this.$Notice.error({
            title: '无法处理你的请求',
            desc: err.msg
          });
          this.pageData.totals = 1;
          this.pageData.page = 1;
        });
    }
  }
};
</script>
<style lang="scss" scoped>
.novel {
  .input-body {
    height: 100%;
    margin-top: 25%;
  }
}

.novel {
  width: 650px;
  margin: 0 auto 100px;
}

.btn-group {
  text-align: center;
}
@media screen and (max-width: 767px) {
  .novel {
    width: 80%;
    min-width: 320px;
    margin: 0 auto;
  }
}
</style>
