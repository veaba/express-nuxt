
数据库表结构设计

|名称|数据类型|描述
|----|----|----|
_id 	    |{String}   |mongodb Id
name 		|{String}	|英文名称，小写 
name_desc	|{String}	|名称中文描述
parent		|{Array} 	|对象数组形式父级，字段id
type		|{String} 	|英文type 
type_desc	|{String} 	|对type的中文描述
children   	|{Array} 	|对象数组形式
router      |{String}   |判断是来自哪一个路由需求的
rank        |{Number}   |排行高低
数据库表结构设计

```js
var ob={
    'asyncData':{name_desc:'',pages:''},
    'fetch':{

    },'head':{
        
    },'layout':{
        
    },'middleware':{
        
    },'scrollToTop':{
        
    },'transition':{
        
    },'validate':{
        
    },'watchQuery':{
        
    },'nuxt':{
        
    },'nuxt-child':{
        
    },'nuxt-link':{
        
    },'no-ssr':{
        
    },'build':{
        
    },'buildDir':{
        
    },'css':{
        
    },'dev':{
        
    },'env':{
        
    },'generate':{
        
    },'head':{
        
    },'loading':{
        
    },'loadingIndicator':{
        
    },'mode':{
        
    },'modules':{
        
    },'plugins':{
        
    },'render':{
        
    },'rootDir':{
        
    },'router':{
        
    },'serverMiddleware':{
        
    },'srcDir':{
        
    },'transition':{
        
    },'watchers':{
        
    },'Usage':{
        
    },'render':{
        
    },'renderRoute':{
        
    },'render':{
        
    }}

```
```js
[
    {	_id:'asdidjajdioasjd',
     	name:'context',
     	name_desc:'',
     	parent:[],
     	type:'Essential',
     	type_desc:'',
     	children:[],
     	rank:1000,
     	router:'nuxt'
	},  
	{	_id:'das33csasdsadas',
        name:'asyncData',
        name_desc:'',
        parent:[],
        type:'Essential',
        type_desc:'',
        children:[],
		rank:2000,
     	router:'nuxt'
    },
    {	_id:'das33csasdsadas',
        name:'asyncData',
        name_desc:'',
        parent:['das33csasdsadas'],
        type:'Essential',
        type_desc:'',
        children:['asdidjajdioasjd']
       }
]

```

返回到前端的数据结果设计，rank 越低越在前面
```js
[
    {	_id:'das33csasdsadas',
        name:'asyncData',
        name_desc:'',
        parent:[
            {
	        	_id:'das33csasdsadas',
		        name:'asyncData',
				name_desc:'',
				parent:[],
				type:'Essential',
				type_desc:'',
				children:[]
          
        	}
        ],
        type:'Essential',
        type_desc:'',
        children:[
            {
		        _id:'asdidjajdioasjd',
	            name:'context',
	            name_desc:'',
	            parent:[],
	            type:'Essential',
	            type_desc:'',
	            children:[]
      	
        	}
        ],
        rank:1000,
        router:'nuxt'
       }
]


```


本质
- 上下文Context

页面  
- asyncData
