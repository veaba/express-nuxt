<!------------------------
 *@name Vue.js
 *@author Jo.gel
 *@date 2018/4/20
 *@desc 网络小说下载
 -------------------------->
<template>
    <section class="container">
        <div class="novel">
            <div class="input-body">
                <Input v-model="keyword" size="large" icon="search" placeholder="查找的小说" @on-enter="getNovel"
                       @on-click="getNovel"></Input>
            </div>
        </div>
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
        keyword: '纯阳武神'
      }
    },
    methods: {
      /**
       * @desc 获取小说
       * */
      getNovel () {
        if (!this.keyword) {
          this.$Message.error('尚未输入小说名')
          return false
        }
        this.$ajax.get('/api/novel/getNovel', {
          params: {
            keyword: this.keyword
          }
        })
          .then(res => {
            if (res.errorCode === 0) {
              this.$Notice.success({
                title: res.data.start + '开始处理',
                desc: res.msg
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
        margin: 0 auto;
    }

    @media screen and (max-width: 767px){
        .novel{
            width: 80%;
            min-width: 320px;
            margin: 0 auto;
        }
    }
</style>
