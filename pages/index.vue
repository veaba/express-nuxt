<template>
    <article>
        <section class="section">
            <img src="~assets/img/logo.png" alt="Nuxt.js Logo" class="logo"/>
            <h1 class="title">
                USERS
            </h1>
            <section class="banner"></section>
            <section class="section-item">
                <div class="item3x">
                    <div class="item3x-content">1 item</div>
                    <div class="item3x-footer">I am a item * 3 title</div>
                </div>
                <div class="item3x">
                    <div class="item3x-content">2 item</div>
                    <div class="item3x-footer">I am a item * 3 title</div>
                </div>
                <div class="item3x">
                    <div class="item3x-content">3 item</div>
                    <div class="item3x-footer">I am a item * 3 title</div>
                </div>
            </section>
        </section>
    </article>
</template>

<script>
  export default {
    data () {
      return {}
    },
    /* asyncData (context) {
      console.info(context.env)
      return { project: 'nuxt' }
    }, */
    mounted () {
    },
    methods: {}
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
