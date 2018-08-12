<template>
    <article>
      <canvas id="homeCanvas" :width="width" :height="height" style="border: 1px solid red;"></canvas>
        <!--<section class="section">-->
            <!--<img src="~assets/img/logo.png" alt="Nuxt.js Logo" class="logo"/>-->
            <!--<h1 class="title">-->
                <!--USERS-->
            <!--</h1>-->
            <!--<section class="banner"></section>-->
            <!--<section class="section-item">-->
                <!--<div class="item3x">-->
                    <!--<div class="item3x-content">1 item</div>-->
                    <!--<div class="item3x-footer">I am a item * 3 title</div>-->
                <!--</div>-->
                <!--<div class="item3x">-->
                    <!--<div class="item3x-content">2 item</div>-->
                    <!--<div class="item3x-footer">I am a item * 3 title</div>-->
                <!--</div>-->
                <!--<div class="item3x">-->
                    <!--<div class="item3x-content">3 item</div>-->
                    <!--<div class="item3x-footer">I am a item * 3 title</div>-->
                <!--</div>-->
            <!--</section>-->
        <!--</section>-->
    </article>
</template>

<script>
  const RADIUS = 120; // 圆的半径
  const ANGLE = 30; // 旋转的角度
  // const WIDTH = 600; // 宽度
  // const HEIGHT = 400; // 高度
  // const DOT_X = 200; // 圆点X轴
  // const DOT_Y = 300; // 圆点Y轴
  const GIRTH = 2 * Math.PI * RADIUS; // 半径60的周长
  export default {
    name: 'Home',
    data () {
      return {
        height: 400,
        width: 600
      }
    },
    /* asyncData (context) {
      console.info(context.env)
      return { project: 'nuxt' }
    }, */
    mounted () {
      this.Init()
      this.height = window.innerHeight || 0;
      this.width = window.innerWidth || 0;
    },
    methods: {
      /**
       * @desc 求sin α
       * */
      sinAngle (angle) {
        return Math.round(Math.sin(angle * Math.PI / 180) * 1000000) / 1000000;
      },
      /**
       * @desc 求cos α
       * */
      cosAngle (angle) {
        return Math.round(Math.cos(angle * Math.PI / 180) * 1000000) / 1000000;
      },
      /**
       * @des Init 初始化函数
       * */
      Init () {
        window.requestAnimationFrame(this.draw)
      },
      /**
       * @desc 绘制函数
       * */
      draw () {
        const canvas = document.getElementById('homeCanvas')// 获取位置的id
        const ctx = canvas.getContext('2d')// 获取canvas的上下文对象
        const time = new Date()
        ctx.globalCompositeOperation = 'destination-over';// todo 忘记做什么了
        // 第一步 清空画布
        ctx.clearRect(0, 0, this.width, this.height)

        // 秒钟
        ctx.save()
        ctx.translate(this.width / 2, this.height / 2)// (200,300)(DOT_X, DOT_Y)
        ctx.fillStyle = 'red'
        ctx.rotate(time.getSeconds() * -30 * Math.PI / 180)
        ctx.fillRect(0, 0, 1, RADIUS)
        ctx.restore()

        // 绘制最长的线
        this.animation(ctx, 0, RADIUS, 'blue', 12)
        this.animation(ctx, ANGLE, RADIUS, 'red', 11)
        this.animation(ctx, 2 * ANGLE, RADIUS, 'green', 10)
        this.animation(ctx, 3 * ANGLE, RADIUS, 'blue', 9)
        this.animation(ctx, 4 * ANGLE, RADIUS, 'blue', 8)
        this.animation(ctx, 5 * ANGLE, RADIUS, 'blue', 7)
        this.animation(ctx, 6 * ANGLE, RADIUS, 'blue', 6)
        this.animation(ctx, 7 * ANGLE, RADIUS, 'blue', 5)
        this.animation(ctx, 8 * ANGLE, RADIUS, 'blue', 4)
        this.animation(ctx, 9 * ANGLE, RADIUS, 'blue', 3)
        this.animation(ctx, 10 * ANGLE, RADIUS, 'blue', 2)
        this.animation(ctx, 11 * ANGLE, RADIUS, 'blue', 1)
        ctx.beginPath(); // beginPath() 丢弃任何当前定义的路径并且开始一条新的路径。它把当前的点设置为 (0,0)。
        window.requestAnimationFrame(this.draw);
      },
      /**
       * @desc animation
       * */
      animation (ctx, angle, radius, color, percent) {
        ctx.save()
        ctx.strokeStyle = color
        const sinAngle = this.sinAngle(angle)
        const cosAngle = this.cosAngle(angle)
        console.info(angle * 30);
        ctx.moveTo(this.width / 2 + sinAngle * radius, this.height / 2 + cosAngle * radius)
        ctx.lineTo((this.width / 2 + sinAngle * radius) + cosAngle * percent / 12 * GIRTH, (this.height / 2 + cosAngle * RADIUS) - sinAngle * percent / 12 * GIRTH)
        ctx.stroke()
        ctx.restore()
      }
    }
  }
</script>

<style scoped lang="scss">
    .title {
        margin: 30px 0;
    }

    article {
        section {
            position: relative;
            .banner {
                width: 100%;
                height: 275px;
                background: radial-gradient(circle at 50%, #022647, #3b1d47);
                /*background: linear-gradient(to right,#022647,#3b1d47);*/
            }
            .section-item{
                display: flex;
                margin-top: 20px;
            }
            .item3x {
                position: relative;
                display: flex;
                flex: 1;
                width: 100%;
                height: 275px;
                -webkit-box-sizing: border-box;
                -moz-box-sizing: border-box;
                box-sizing: border-box;
                .item3x-content {
                    position: relative;
                    background: radial-gradient(circle at 50%, #022647, #3b1d47);
                    z-index: 1;
                    width: 100%;
                    line-height: 275px;
                    font-size: 48px;
                }
                .item3x-footer {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 80px;
                    padding: 10px;
                    line-height: 80px;
                    font-size: 18px;
                    text-align: left;
                    color: #fff;
                    overflow: hidden;
                    z-index: 2;
                    /*background: linear-gradient(to right,#022647,#3b1d47);*/
                    background: rgba(0, 0, 0, .4)
                }
                &{
                    margin: 0 5px;
                }
                &:first-child{
                    margin: 0 10px 0 0;
                }

                &:last-child{
                    margin: 0 0 0 10px;
                }
            }
            &:after {
                display: block;
                clear: both;
                content: '';
                width: 0;
                height: 0;
            }
        }
        .section {
            position: relative;
            width: 1200px;
            margin: 0 auto;
            background: #fff;
        }
    }

    .users {
        list-style: none;
        margin: 0;
        padding: 0;
    }

    .user {
        margin: 10px 0;
    }
</style>
