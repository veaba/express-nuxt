webpackJsonp([20],{"/TYz":function(t,i,e){"use strict";Object.defineProperty(i,"__esModule",{value:!0});var a=e("kG9/"),n=e("Xb8E"),o=!1;var s=function(t){o||e("1n7H")},r=e("ngHh")(a.a,n.a,!1,s,"data-v-1b011d9c",null);r.options.__file="pages\\index.vue",i.default=r.exports},"1n7H":function(t,i,e){var a=e("2bon");"string"==typeof a&&(a=[[t.i,a,""]]),a.locals&&(t.exports=a.locals);e("bUva")("9e4b3aec",a,!1,{sourceMap:!1})},"2bon":function(t,i,e){(t.exports=e("yKCJ")(!1)).push([t.i,'.title[data-v-1b011d9c]{margin:30px 0}article section[data-v-1b011d9c]{position:relative}article section .banner[data-v-1b011d9c]{width:100%;height:275px;background:radial-gradient(circle at 50%,#022647,#3b1d47)}article section .section-item[data-v-1b011d9c]{display:-webkit-box;display:-ms-flexbox;display:flex;margin-top:20px}article section .item3x[data-v-1b011d9c]{position:relative;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-flex:1;-ms-flex:1;flex:1;width:100%;height:275px;-webkit-box-sizing:border-box;box-sizing:border-box}article section .item3x .item3x-content[data-v-1b011d9c]{position:relative;background:radial-gradient(circle at 50%,#022647,#3b1d47);z-index:1;width:100%;line-height:275px;font-size:48px}article section .item3x .item3x-footer[data-v-1b011d9c]{position:absolute;bottom:0;left:0;width:100%;height:80px;padding:10px;line-height:80px;font-size:18px;text-align:left;color:#fff;overflow:hidden;z-index:2;background:rgba(0,0,0,.4)}article section .item3x[data-v-1b011d9c]{margin:0 5px}article section .item3x[data-v-1b011d9c]:first-child{margin:0 10px 0 0}article section .item3x[data-v-1b011d9c]:last-child{margin:0 0 0 10px}article section[data-v-1b011d9c]:after{display:block;clear:both;content:"";width:0;height:0}article .section[data-v-1b011d9c]{position:relative;width:1200px;margin:0 auto;background:#fff}.users[data-v-1b011d9c]{list-style:none;margin:0;padding:0}.user[data-v-1b011d9c]{margin:10px 0}',""])},Xb8E:function(t,i,e){"use strict";var a=function(){var t=this.$createElement,i=this._self._c||t;return i("article",[i("canvas",{staticStyle:{border:"1px solid red"},attrs:{id:"homeCanvas",width:this.width,height:this.height}})])};a._withStripped=!0;var n={render:a,staticRenderFns:[]};i.a=n},"kG9/":function(t,i,e){"use strict";var a=2*Math.PI*120;i.a={name:"Home",data:function(){return{height:400,width:600}},mounted:function(){this.Init(),this.height=window.innerHeight||0,this.width=window.innerWidth||0},methods:{sinAngle:function(t){return Math.round(1e6*Math.sin(t*Math.PI/180))/1e6},cosAngle:function(t){return Math.round(1e6*Math.cos(t*Math.PI/180))/1e6},Init:function(){window.requestAnimationFrame(this.draw)},draw:function(){var t=document.getElementById("homeCanvas").getContext("2d"),i=new Date;t.globalCompositeOperation="destination-over",t.clearRect(0,0,this.width,this.height),t.save(),t.translate(this.width/2,this.height/2),t.fillStyle="red",t.rotate(-30*i.getSeconds()*Math.PI/180),t.fillRect(0,0,1,120),t.restore(),this.animation(t,0,120,"blue",12),this.animation(t,30,120,"red",11),this.animation(t,60,120,"green",10),this.animation(t,90,120,"blue",9),this.animation(t,120,120,"blue",8),this.animation(t,150,120,"blue",7),this.animation(t,180,120,"blue",6),this.animation(t,210,120,"blue",5),this.animation(t,240,120,"blue",4),this.animation(t,270,120,"blue",3),this.animation(t,300,120,"blue",2),this.animation(t,330,120,"blue",1),t.beginPath(),window.requestAnimationFrame(this.draw)},animation:function(t,i,e,n,o){t.save(),t.strokeStyle=n;var s=this.sinAngle(i),r=this.cosAngle(i);console.info(30*i),t.moveTo(this.width/2+s*e,this.height/2+r*e),t.lineTo(this.width/2+s*e+r*o/12*a,this.height/2+120*r-s*o/12*a),t.stroke(),t.restore()}}}}});