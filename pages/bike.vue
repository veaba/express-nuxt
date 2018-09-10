<!--
@desc 今天2018年8月22日13点多下路发现，自行车不见了，然后报警。
@desc 网友说，可以试试写个爬虫，看能不能找到，万一找到呢？
@desc 于是我就写了！这个爬虫页面
@desc 这个功能就叫，找回我的自行车
-->
<template>
  <section class="container">
    <div class="bike">
      22dd
      <div class="bike-input">
        <i-input style="width: 200px;" v-model="bikeData.brand_name">{{bikeData.brand_name}}</i-input>
        <i-input style="width: 200px" v-model="bikeData.brand_uppercase">{{bikeData.brand_uppercase}}</i-input>
        <i-input style="width: 200px" v-model="bikeData.brand_lowercase">{{bikeData.brand_lowercase}}</i-input>
        <i-input style="width: 200px" v-model="bikeData.brand_color">{{bikeData.brand_color}}</i-input>
        <i-input style="width: 200px" v-model="bikeData.brand_size">{{bikeData.brand_size}}</i-input>
        <i-input style="width: 200px" v-model="bikeData.brand_type">{{bikeData.brand_type}}</i-input>
        <i-input style="width: 200px" v-model="bikeData.brand_head">{{bikeData.brand_head}}</i-input>
      </div>

      <!--cookie-->
      <div class="bike-cookie"></div>
      <!--button-->
      <div class="bike-button">
        <Button @click="goSearchMyBike" type="primary"></Button>
      </div>
      <!--table-->
      <div class="bike-table">
        <Table :loading="loading" :data="bikeTable" :columns="bikeColumns"></Table>
        <Row class="pageBox" type="flex" justify="end">
          <Page :total="pageData.totals" :current.sync="pageData.page" show-total @on-change="goSearchMyBike"></Page>
        </Row>
      </div>
    </div>
  </section>
</template>

<script>
  export default {
    name: 'bike',
    data () {
      return {
        loading: false,
        bikeData: {
          brand_name: '喜德盛', // 品牌名
          brand_uppercase: 'XDS', // 大写
          brand_lowercase: 'xds', // 小写
          brand_model: 'rx280', // 型号
          brand_color: '紫色', // 主色
          brand_size: '700c', // 车轮大小
          brand_type: '公路车', // 山地车还是公路车还是其他?
          brand_head: '弯把'// 车头直把还是弯把
        },
        bikeTable: [],
        bikeColumns: [
          {
            title: '序号',
            type: 'index',
            sortable: true,
            width: 80
          },
          {
            title: '来源',
            key: 'source'
          },
          {
            title: '图片',
            key: 'img'
          },
          {
            title: 'url',
            key: 'url'
          },
          {
            title: '地区',
            key: 'local'
          },
          {
            tile: '时间',
            key: 'date'
          },
          {
            title: '价格',
            key: 'price'
          }
        ],
        pageData: {
          page: 1,
          totals: 1,
          isVip: '', // 1 vip 0 普通
          hasContent: '' // 有内容
        },
        searchData: {
          58: ''
        }
      }
    },
    methods: {
      /**
       * @desc 皮卡丘走起
       */
      goSearchMyBike () {
        this.loading = true
        this.$ajax.post('/api/bike/searchBike', this.bikeData)
          .then(res => {
            this.loading = false
            this.bikeData = []
            console.info(res);
          })
          .catch(err => {
            this.loading = false
            this.bikeData = []
            console.info(err);
          })
      }
    }
  }
</script>

<style scoped lang="scss">
  .bike-input {
    display: flex;
    flex-direction: column;
  }
</style>
