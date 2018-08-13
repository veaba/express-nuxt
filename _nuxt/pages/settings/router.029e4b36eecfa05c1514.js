webpackJsonp([11],{Cq2t:function(t,e,r){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=r("kLWv"),a=r("qMGu"),n=!1;var s=function(t){n||r("UXIl")},u=r("VU/8")(o.a,a.a,!1,s,"data-v-553824cc",null);u.options.__file="pages/settings/router.vue",e.default=u.exports},UXIl:function(t,e,r){var o=r("ZFi2");"string"==typeof o&&(o=[[t.i,o,""]]),o.locals&&(t.exports=o.locals);r("rjj0")("95962d54",o,!1,{sourceMap:!1})},ZFi2:function(t,e,r){(t.exports=r("FZ+f")(!1)).push([t.i,"",""])},kLWv:function(t,e,r){"use strict";e.a={name:"routerList",layout:"console",components:{},data:function(){var t=this;return{search_router:"",msg:"Hello world router VueJS",routerData:[],routerCol:[{title:"名称",key:"name"},{title:"状态",key:"status"},{title:"类别",key:"type"},{title:"操作",key:"actions",render:function(e,r){return e("Button",{props:{type:"ghost"},on:{click:function(){t.deleteRouter(r.row.name)}}},"删除")}}],addRouterStatus:!1,routerStatusList:["ban","normal","keep"],routerTypeList:["official","brand","user","org"],routerItem:{name:"",status:"keep",type:"brand"}}},created:function(){this.getRouterAPI()},methods:{onSearchRouter:function(){this.getRouterAPI()},getRouterAPI:function(){var t=this;this.$ajax.get("/api/getRouterList",{params:{name:this.search_router}}).then(function(e){console.info(e),0===e.errorCode?t.routerData=e.data:t.routerData=[]}).catch(function(t){console.info(t)})},onAddRouterModal:function(){this.addRouterStatus=!0},onAddRouter:function(){var t=this;this.$ajax.post("/api/addRouter",this.routerItem).then(function(e){0===e.errorCode?t.getRouterAPI():t.$Message.error(e.msg||"后台错误")}).catch(function(e){t.$Message.error(e.msg||"服务端错误")})},deleteRouter:function(t){var e=this;console.info(t),this.$ajax.post("/api/deleteRouter",{name:t}).then(function(t){0===t.errorCode?e.getRouterAPI():e.$Message.error(t.msg||"后台错误")}).catch(function(t){e.$Message.error(t.msg||"服务端错误")})}}}},qMGu:function(t,e,r){"use strict";var o=function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("div",{staticClass:"router-list"},[r("Row",{staticClass:"m-bottom-10 p-top-20",attrs:{type:"flex",justity:"end",gutter:8}},[r("i-col",{attrs:{span:"18"}},[r("Button",{attrs:{type:"primary"},on:{click:t.onAddRouterModal}},[t._v(" 添加路由")])],1),r("i-col",{attrs:{span:"6"}},[r("Input",{attrs:{icon:"search"},on:{"on-click":t.onSearchRouter,"on-enter":t.onSearchRouter},model:{value:t.search_router,callback:function(e){t.search_router=e},expression:"search_router"}})],1)],1),r("Row",[r("i-col",{attrs:{span:"24"}},[r("Table",{attrs:{data:t.routerData,columns:t.routerCol}})],1)],1),r("Modal",{attrs:{width:"900"},on:{"on-ok":t.onAddRouter},model:{value:t.addRouterStatus,callback:function(e){t.addRouterStatus=e},expression:"addRouterStatus"}},[r("p",{attrs:{slot:"header"},slot:"header"},[t._v("添加路由")]),r("Row",[r("i-col",{attrs:{span:"21"}},[r("Form",{attrs:{"label-width":120},model:{value:t.routerItem,callback:function(e){t.routerItem=e},expression:"routerItem"}},[r("Form-item",{attrs:{label:"路由名称",required:""}},[r("i-Input",{model:{value:t.routerItem.name,callback:function(e){t.$set(t.routerItem,"name",e)},expression:"routerItem.name"}})],1),t._v("\n                    ,\n                    "),r("Form-item",{attrs:{label:"路由状态",required:""}},[r("i-select",{model:{value:t.routerItem.status,callback:function(e){t.$set(t.routerItem,"status",e)},expression:"routerItem.status"}},t._l(t.routerStatusList,function(e,o){return r("Option",{key:o,attrs:{value:e}},[t._v(t._s(e)+"\n                            ")])}))],1),t._v("\n                    ,\n                    "),r("Form-item",{attrs:{label:"路由类别",required:""}},[r("i-select",{model:{value:t.routerItem.type,callback:function(e){t.$set(t.routerItem,"type",e)},expression:"routerItem.type"}},t._l(t.routerTypeList,function(e,o){return r("Option",{key:o,attrs:{value:e}},[t._v(t._s(e)+"\n                            ")])}))],1)],1)],1)],1)],1)],1)};o._withStripped=!0;var a={render:o,staticRenderFns:[]};e.a=a}});