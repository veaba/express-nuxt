webpackJsonp([3],{"5zde":function(t,e,o){o("zQR9"),o("qyJz"),t.exports=o("FeBl").Array.from},Gu7T:function(t,e,o){"use strict";e.__esModule=!0;var n=function(t){return t&&t.__esModule?t:{default:t}}(o("c/Tr"));e.default=function(t){if(Array.isArray(t)){for(var e=0,o=Array(t.length);e<t.length;e++)o[e]=t[e];return o}return(0,n.default)(t)}},PMX5:function(t,e,o){"use strict";var n=o("Gu7T"),a=o.n(n),s=o("BO1k"),i=o.n(s),r=o("YbGK");e.a={name:"novel",components:{},data:function(){return{keyword:"茅山鬼谷门",loading:!1,selectType:"customer",customerUrl:"https://www.biduo.cc/biquge/44_44762/ ",progressStatus:"active",percent:0,newNovelDownload:!1,disabledDownload:!1,webSocketCount:0,webSocketCountData:[],novelTable:[],novelData:[],pageData:{page:1,totals:1,isVip:"",hasContent:""},novelColumns:[{title:"序号",type:"index",sortable:!0,width:80},{title:"uuid",key:"uuid",sortable:!0,width:80},{title:"是否抓取成功",key:"hasContent",width:110,render:function(t,e){return t("span",e.row.hasContent?"成功":"失败")}},{title:"类型",key:"isVip",width:80,render:function(t,e){return t("span",e.row.isVip?"vip":"普通")}},{title:"小说",width:120,key:"name"},{title:"章节名称",width:200,key:"title"},{title:"字数",key:"length",width:100,sortable:!0},{title:"是否超时",width:100,sortable:!0,render:function(t,e){return t("span",e.row.timeout?"是":"-")}},{title:"内容预览",minWidth:480,ellipsis:!0,key:"preview",render:function(t,e){return t("span",e.row.preview.trim())}}],isDev:r.default.dev}},computed:{isDoneWebSocketCustomer:function(){var t=this.webSocketCountData.length,e=this.webSocketCount;return!(!this.webSocketCount||t+1!==e&&t!==e)&&(this.disabledDownload=!1,!0)},novelCustomerContent:function(){var t=this.novelData.sort(function(t,e){return t.index-e.index}),e="",o=!0,n=!1,a=void 0;try{for(var s,r=i()(t);!(o=(s=r.next()).done);o=!0){var c=s.value;e=e+"    "+c.title+this.formatNovelData(c.content)+"\n\n"}}catch(t){n=!0,a=t}finally{try{!o&&r.return&&r.return()}finally{if(n)throw a}}return e}},mounted:function(){this.webSocketReceive(),this.changeFlipPage()},updated:function(){},methods:{webSocketReceive:function(){var t=this;this.$socket.on("isConnectSocketStatus",function(t){console.info(t)}),this.$socket.on("novel",function(e){0===e.errorCode&&(t.loading=!1,"latest"===e.data.eventType&&(t.percent=100),console.info(e),t.$Notice.success({duration:0,title:e.msg||"",render:function(t){return t("div",[t("p",["下载地址：",t("a",{attrs:{href:location.origin+e.data.url,download:e.data.name+".txt"}},e.data.name)]),t("p","开始时间："+e.data.startTime||""),t("p","结束时间："+e.data.endTime||""),t("p","耗时(s)："+e.data.timeConsuming||""),t("p","总章节："+e.data.count||""),t("p","成功章节："+Number(e.data.count-e.data.failCount)),t("p","失败章节："+e.data.failCount||"")])}}),t.newNovelDownload=!0)}),this.$socket.on("novelData",function(e){console.info(e),0===e.errorCode&&(t.novelTable=e.data||[],t.pageData.totals=e.totals||1,t.pageData.page=e.pageCurrent||1),t.loading=!1,t.percent=100}),this.$socket.on("missionFail",function(e){console.info(e),e.errorCode&&(t.percent=100,t.$Notice.warning({title:"任务失败",desc:e.msg||"error"})),t.progressStatus="wrong"}),this.$socket.on("download",function(e){var o;0===e.errorCode&&(t.webSocketCountData.push(e.index),(o=t.novelData).push.apply(o,a()(e.data)))}),this.$socket.on("downloadNotify",function(e){0===e.errorCode&&(t.webSocketCount=e.count,t.$Notice.success({duration:0,title:e.msg||"",render:function(t){return t("div",[t("p","开始时间："+e.startTime||""),t("p","结束时间："+e.endTime||""),t("p","耗时(s)："+e.timeConsuming||""),t("p","总章节："+e.count||""),t("p","成功章节："+Number(e.count-e.failCount)),t("p","失败章节："+e.failCount||"")])}}))}),this.$socket.on("receive1",function(t){console.info(t)})},formatNovelData:function(t){return t.replace(/    /g,"\n\n    ")},downloadBook:function(){var t=new Blob([this.novelCustomerContent],{type:"text/plain"}),e=document.createElement("a");return e.innerHTML=this.keyword+".txt",e.href=window.URL.createObjectURL(t),e.download=this.keyword+".txt",this.$nextTick(function(){document.querySelector(".download")&&(console.info(document.querySelector(".download")),document.querySelector(".download").appendChild(e))}),console.info(e),e},downloadNotify:function(){"default"===this.selectType?this.downloadDefault():this.downloadCustomer()},downloadDefault:function(){var t=this;this.webSocketCount=0,this.webSocketCountData=[],this.novelData=[],this.disabledDownload=!0,this.$ajax.get("/api/novel/download?keyword="+this.keyword).then(function(e){console.info(e),t.disabledDownload=!1,t.downloadBook(),t.webSocketCount=e.count,console.info("count:"+e.count),console.info("failCount:"+e.failCount),t.$Notice.success({duration:0,title:e.msg||"",render:function(t){return t("div",[t("p","开始时间："+e.startTime||""),t("p","结束时间："+e.endTime||""),t("p","耗时(s)："+e.timeConsuming||""),t("p","总章节："+e.count||""),t("p","成功章节："+Number(e.count-e.failCount)),t("p","失败章节："+e.failCount||"")])}})}).catch(function(t){console.info(t)})},downloadCustomer:function(){this.customerNovel()},novelTesting:function(){console.info(11),this.$ajax.get("/api/novel/novelTesting").then(function(t){console.info(t)}).catch(function(t){console.info(t)})},changeFlipPage:function(){var t=this;this.loading=!0,this.$ajax.get("/api/novel/getNovelList",{params:{keyword:this.keyword,page:this.pageData.page,isVip:this.pageData.isVip,hasContent:this.pageData.hasContent}}).then(function(e){t.loading=!1,0===e.errorCode?(t.novelTable=e.data||[],t.pageData.totals=e.totals||1):t.novelTable=[]}).catch(function(e){console.info(e),t.loading=!1,t.pageData.totals=e.totals||1})},setProgress:function(){var t=this;this.percent=0;var e=setInterval(function(){return t.percent<99&&t.percent++,t.percent>98&&t.percent<100?(t.percent=99,clearInterval(e),!1):100===t.percent?(clearInterval(e),!1):void console.log(t.percent)},1e3)},sendSome:function(){this.$socket.emit("receive",{params:"客户端发给你的一段消息"})},onClearNovel:function(){var t=this;this.$ajax.post("/api/novel/clearNovel").then(function(e){0===e.errorCode?t.$Notice.success({title:"任务成功",desc:e.msg||"success"}):(t.progressStatus="wrong",t.$Notice.warning({title:"任务失败",desc:e.msg||"error"}))}).catch(function(t){console.info(t)})},getNovel:function(){return this.keyword?"customer"!==this.selectType||this.customerUrl?(this.$Notice.close("novelNotify"),void("default"===this.selectType?this.qiQianNovel():this.customerNovel())):(this.$Message.error("请输入爬取目标小说目录所在的url"),!1):(this.$Message.error("尚未输入小说名"),!1)},qiQianNovel:function(){var t=this;this.loading=!0,this.$ajax.get("/api/novel/getNovel",{params:{keyword:this.keyword.trim()}}).then(function(e){console.info(e),t.loading=!1,t.novelTable=[],0===e.errorCode?(t.setProgress(),t.$Notice.success({title:e.data.start+"开始处理",desc:e.msg})):t.$Notice.warning({title:e.msg||"",desc:e.data||[]})}).catch(function(e){t.$Notice.error({title:"无法处理你的请求",desc:e.msg})})},customerNovel:function(){var t=this;this.loading=!0,this.setProgress(),this.$ajax.post("/api/novel/customizedNovel",{url:this.customerUrl,keyword:this.keyword.trim()}).then(function(e){console.info(e),t.loading=!1,0===e.errorCode?(t.webSocketCount=e.count,t.percent=100,t.downloadBook(),t.$Notice.success({duration:0,title:e.msg||"",render:function(t){return t("div",[t("p","开始时间："+e.startTime||""),t("p","结束时间："+e.endTime||""),t("p","耗时(s)："+e.timeConsuming||""),t("p","总章节："+e.count||""),t("p","成功章节："+Number(e.count-e.failCount)),t("p","失败章节："+e.failCount||"")])}})):(t.percent=100,t.$Notice.warning({title:e.msg||"",desc:e.data||[]}))}).catch(function(e){t.$Notice.error({title:"无法处理你的请求",desc:e.msg}),t.pageData.totals=1,t.pageData.page=1})}}}},TAS0:function(t,e,o){var n=o("meAJ");"string"==typeof n&&(n=[[t.i,n,""]]),n.locals&&(t.exports=n.locals);o("rjj0")("15c215a0",n,!1,{sourceMap:!1})},"TI/+":function(t,e,o){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var n=o("PMX5"),a=o("cCmq"),s=!1;var i=function(t){s||o("TAS0")},r=o("VU/8")(n.a,a.a,!1,i,"data-v-2ed6a393",null);r.options.__file="pages/novel.vue",e.default=r.exports},YbGK:function(t,e,o){"use strict";(function(t,e){var n=o("Dd8w"),a=o.n(n),s="GH_PAGES"===t.env.DEPLOY_ENV?{router:{base:"/express-nuxt/"}}:{};e.exports=a()({},s,{head:{title:"beike.io",meta:[{charset:"utf-8"},{name:"viewport",content:"width=device-width, initial-scale=1"},{hid:"description",name:"description",content:"Nuxt.js project"}],link:[{rel:"icon",type:"image/x-icon",href:"/favicon.ico"}]},css:["~/assets/css/main.css",{src:"~assets/scss/main.scss",lang:"scss"},{src:"~assets/scss/common.scss",lang:"scss"},{src:"~assets/scss/iViewFix.scss",lang:"scss"},{src:"~assets/scss/markdown.scss",lang:"scss"}],build:{vendor:["axios"],extend:function(t,e){var o=e.isClient,n=e.isDev;o&&n&&t.module.rules.push({enforce:"pre",test:/\.(js|vue)$/,loader:"eslint-loader",exclude:/(node_modules)/})}},dev:!1,env:{baseUrl:t.env.BASE_URL||"http://localhost:4000",HOST:"0.0.0.0",PORT:"4000"},plugins:["~plugins/axios","~plugins/highlight-plugins","~plugins/iview","~plugins/socket",{src:"~plugins/mavon-editor",ssr:!1}],router:{}})}).call(e,o("W2nU"),o("f1Eh")(t))},"c/Tr":function(t,e,o){t.exports={default:o("5zde"),__esModule:!0}},cCmq:function(t,e,o){"use strict";var n=function(){var t=this,e=t.$createElement,o=t._self._c||e;return o("section",{staticClass:"container"},[o("div",{staticClass:"send-socket"},[o("Button",{attrs:{type:"ghost"},on:{click:t.sendSome}},[t._v("发送一段文字")])],1),o("div",{staticClass:"novel"},[o("div",{staticClass:"input-body"},[o("i-input",{attrs:{size:"large",icon:"search",placeholder:"查找的小说"},model:{value:t.keyword,callback:function(e){t.keyword=e},expression:"keyword"}},[o("Select",{staticStyle:{width:"70px"},attrs:{slot:"append"},slot:"append",model:{value:t.selectType,callback:function(e){t.selectType=e},expression:"selectType"}},[o("Option",{attrs:{value:"default"}},[t._v("默认")]),o("Option",{attrs:{value:"customer"}},[t._v("自定义")])],1)],1),"customer"===t.selectType?o("Input",{staticStyle:{"margin-top":"20px"},attrs:{size:"large",icon:"network",placeholder:"请输入小说的目录URL"},model:{value:t.customerUrl,callback:function(e){t.customerUrl=e},expression:"customerUrl"}}):t._e()],1),o("Button",{staticStyle:{"margin-top":"20px"},attrs:{type:"primary",long:""},on:{click:t.getNovel}},[t._v("更新小说内容")]),o("ButtonGroup",{staticStyle:{"margin-top":"20px"}},[o("Button",{attrs:{type:"ghost",size:"small"},on:{click:t.onClearNovel}},[o("Icon",{attrs:{type:"trash-a"}}),t._v("\n          手动清空任务栈")],1),o("Button",{attrs:{type:"ghost",size:"small"},on:{click:t.changeFlipPage}},[o("Icon",{attrs:{type:"search"}}),t._v("\n          查询该小说")],1),o("Button",{attrs:{type:"ghost",size:"small"},on:{click:t.novelTesting}},[o("Icon",{attrs:{type:"information-circled"}}),t._v("\n          临时测试")],1),o("Button",{staticStyle:{border:"1px solid #2d8cf0",padding:"2px 7px"},attrs:{disabled:t.disabledDownload,type:"ghost",size:"small"},on:{click:t.downloadNotify}},[o("Icon",{attrs:{type:"play"}}),t._v("\n          下载小说\n        ")],1),o("Button",{directives:[{name:"show",rawName:"v-show",value:t.isDoneWebSocketCustomer,expression:"isDoneWebSocketCustomer"}],attrs:{type:"ghost",size:"small"}},[o("Icon",{attrs:{type:"ios-cloud-download"}}),o("span",{staticClass:"download",staticStyle:{"margin-left":"5px"}})],1)],1),o("Row",{staticStyle:{"margin-top":"20px"}},[o("i-col",{attrs:{span:"6"}},[o("Select",{model:{value:t.pageData.isVip,callback:function(e){t.$set(t.pageData,"isVip",e)},expression:"pageData.isVip"}},[o("Option",{attrs:{value:1}},[t._v("vip")]),o("Option",{attrs:{value:0}},[t._v("普通")])],1)],1),o("i-col",{attrs:{span:"6"}},[o("Select",{model:{value:t.pageData.hasContent,callback:function(e){t.$set(t.pageData,"hasContent",e)},expression:"pageData.hasContent"}},[o("Option",{attrs:{value:1}},[t._v("成功的章节")]),o("Option",{attrs:{value:0}},[t._v("失败的章节")])],1)],1)],1)],1),o("Progress",{attrs:{percent:t.percent,status:t.progressStatus}}),o("Table",{attrs:{loading:t.loading,data:t.novelTable,columns:t.novelColumns}}),o("Row",{staticClass:"pageBox",attrs:{type:"flex",justify:"end"}},[o("Page",{attrs:{total:t.pageData.totals,current:t.pageData.page,"show-total":"","on-change":""},on:{"update:current":function(e){t.$set(t.pageData,"page",e)},"on-change":t.changeFlipPage}})],1)],1)};n._withStripped=!0;var a={render:n,staticRenderFns:[]};e.a=a},f1Eh:function(t,e){t.exports=function(t){if(!t.webpackPolyfill){var e=Object.create(t);e.children||(e.children=[]),Object.defineProperty(e,"loaded",{enumerable:!0,get:function(){return e.l}}),Object.defineProperty(e,"id",{enumerable:!0,get:function(){return e.i}}),Object.defineProperty(e,"exports",{enumerable:!0}),e.webpackPolyfill=1}return e}},fBQ2:function(t,e,o){"use strict";var n=o("evD5"),a=o("X8DO");t.exports=function(t,e,o){e in t?n.f(t,e,a(0,o)):t[e]=o}},meAJ:function(t,e,o){(t.exports=o("FZ+f")(!1)).push([t.i,".novel .input-body[data-v-2ed6a393]{height:100%;margin-top:10%}.novel[data-v-2ed6a393]{width:650px;margin:0 auto 100px}@media screen and (max-width:767px){.novel[data-v-2ed6a393]{width:80%;min-width:320px;margin:0 auto}}",""])},qyJz:function(t,e,o){"use strict";var n=o("+ZMJ"),a=o("kM2E"),s=o("sB3e"),i=o("msXi"),r=o("Mhyx"),c=o("QRG4"),l=o("fBQ2"),u=o("3fs2");a(a.S+a.F*!o("dY0y")(function(t){Array.from(t)}),"Array",{from:function(t){var e,o,a,d,p=s(t),f="function"==typeof this?this:Array,h=arguments.length,v=h>1?arguments[1]:void 0,g=void 0!==v,m=0,w=u(p);if(g&&(v=n(v,h>2?arguments[2]:void 0,2)),void 0==w||f==Array&&r(w))for(o=new f(e=c(p.length));e>m;m++)l(o,m,g?v(p[m],m):p[m]);else for(d=w.call(p),o=new f;!(a=d.next()).done;m++)l(o,m,g?i(d,v,[a.value,m],!0):a.value);return o.length=m,o}})}});