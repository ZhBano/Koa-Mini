## 前言

本文是我在阅读 Koa 源码以及参考别的文章后实现迷你版 Koa的过程 ，当你阅读源码后其实实现一个迷你版的 Koa 不会很难，如果体验的可以`npm i zmoa`

本文会循序渐进的解析内部原理，包括：

1. 基础版本的 koa
2. 中间件原理及实现
3. context的实现

## 文件结构
- `application.js`：入口文件，里面包括我们常用的 use 方法、listen 方法以及对 ctx.body 做输出处理
- `context.js`：对`request`和`response`进一步封装，更容易获取值
- `request.js`：对`req`返回的值进行拦截处理
- `response.js`：对`res`返回的值进行拦截处理

## 基础版本
用法：
```js
const Zmoa =require('./Zmoa/application')

let app = new Zmoa()

// 引用中间件
app.use(ctx => {
  ctx.body = '11111'
})

app.listen(3000, '127.0.0.1')

```

`application.js`:

```js
const http = require('http')
module.exports = class Zmoa {
  use(fn) {
    this.fn = fn
  }


  listen(...arg) {
    const server = http.createServer(this.callback())
    return server.listen(...arg)
  }

  callback() {
    const handleRequest = (req, res) => {
      // 创建上下文
      const ctx = this.createContext(req, res)
      // 调用中间件
      this.fn(ctx)
      // 输出内容
      res.end(ctx.body)

    }
    return handleRequest
  }


  //创建上下文
  createContext(req, res) {
    const ctx = {}
    ctx.req = req
    ctx.res = res

    return ctx

  }

}

```
基础版的实现其实很简单，调用`use`将函数储存起来，当开启服务器的时候立即去执行里面的函数，`ctx`可以将`req` `res`合并到一个对象`return`出来这样就形成一个很基础的koa

## 中间件原理
中间件是Koa最精髓的地方,下面著名的洋葱模型

<img src="https://camo.githubusercontent.com/71cc217310fae97f2d3ae244ef4a8ef4ae93b4ea/68747470733a2f2f73312e617831782e636f6d2f323032302f30362f30382f74574d69544a2e6a7067" />

<br/>


洋葱模型的机制在于将一组需要顺序执行的函数复合为一个函数，外层函数的参数实际是内层函数的返回值

当使用`use`注册中间件是会将函数储存到一个数组里,执行中间件时,调用`next`执行下一个中间件,以此类推,当执行完最后一个`next`,由原路返回,就像这样:

```js
app.use((ctx, next) => {
  console.log('1 start')
  next()
  console.log('1 end')
})

app.use((ctx, next) => {
  console.log('2 start')
  next()
  console.log('2 end')
})

app.use((ctx, next) => {
  console.log('3 start')
  next()
  console.log('3 end')
})
```
输出结果如下：
```js
1 start
2 start
3 start
3 end
2 end
1 end
```

下面我们内部实现一下,模拟一个中间件执行过程:

```js
function arr1() {
    console.log('1start')
    arr2()
   
    console.log('1end')
}

function arr2() {
    console.log('2start')
    arr3()
    console.log('2end')
}

function arr3() {
    console.log('3start')
  
    console.log('3end')
}

arr1()


```

是不是看起来简单多了,其实就是按顺序执行下一个方法,于是翻了翻`Koa-compose`源码,其实就一个函数通过传入储存好的中间件数组利用递归的方式执行中间件,我们来实现一下基础版
```js
let ctx={}
function arr1(ctx, next) {
    console.log('1start')
    next()
   
    console.log('1end')
}

function arr2(ctx, next) {
    console.log('2start')
    next()
    console.log('2end')
}

function arr3(ctx, next) {
    console.log('3start')
    next()
    console.log('3end')
}

function compose(arr){

    return ctx=>{
      function dispatch(i){
        const fn =arr[i]


        if(!fn) return 

        
        fn(ctx,()=>dispatch(i+1))
       

      }

      return dispatch(0)

    }

}


let fn=compose([arr1,arr2,arr3])

fn(ctx)


```
这里遇到了一个纠结点，源码执行`next`为什么要用`dispatch.bind(null,i+1)`bing的方式写,提到`bind`最开始想到的`this`指向,但是这里没用到`this`,那真相只有一个,`bing`会创建一个新函数,这里又会想, `dispatch(i+1)`不是传`(ctx, next)=> { next() }`吗,相当于`next`就是`((ctx, next)=> { next() })()`不是合情合理吗
  <br/><br/>
仔细看了看想想自己还是太菜了,其实`dispatch(i+1)`传的应该是一整个函数,敲敲脑袋!!!

既然想清楚了,我们就来补上`Promise`,实现最终版:

```js
let ctx={}
function compose(arr){

    return ctx=>{
      let index=-1
      function dispatch(i){
        const fn =arr[i]
        //防止一个中间件里面存在重复的 next
        if(i<=index) return Promise.reject(new Error('next() called multiple times')
        );

        index=i

        if(!fn) return Promise.resolve();

        try{
          // return Promise.resolve(fn(ctx,dispatch.bind(null, i + 1))) 
          return Promise.resolve(fn(ctx,()=>dispath(i+1)))
        }catch(err){
          return Promise.reject(err)
        }

       

      }

      return dispatch(0)

    }

}

let fn=compose([arr1,arr2,arr3])

fn(ctx)

```




## Context
`ctx`为我们扩展的很多好用的方法，当我们访问`ctx`时内部会劫持`request`和`response`内的属性进行返回，说到劫持就会想到`Object.defineProperty`,在`koa`内部使用的是`__defineGetter__`和`__defineSetter__`属性进行劫持从而实现代理，简单实现一个这个原理:
```js
let target = {
    request: {
       name:'xxx',
        say: function () {
            console.log("Hello");
        },


    }
}

/**
 * @param {Object} proto 被代理对象
 * @param {String} property 被代理对象上的被代理属性
 * @param {String} name
 */
function delegates(proto, property, name){
    proto.__defineGetter__(name, function () {
        console.log(1111)
        return proto[property][name];
      });
      proto.__defineSetter__(name, function (val) {
        console.log(2222)
        return (proto[property][name] = val);
      });
}

console.log(target.name)  // xx
target.name=111
console.log(target.name) // 11

```
然后对其`request`和`response`使用`get`和`set`进行劫持处理，在`application.js`里面通过`Object.create`创建新对象存到原型链下通过一系列的赋值得到`ctx`,像这样:
```js

  createContext(req, res) {
    const ctx=Object.create(this.context)
    //this绑定的是 ctx.request
    ctx.request=Object.create(this.request) 
    ctx.response=Object.create(this.response)

    //进行赋值
    ctx.req=ctx.request.req=req
    ctx.res=ctx.response.res=res

    return ctx

  }
```

## 路由
这个路由是通过参考其他文章+自己理解写的，只怪鄙人太菜了，源码只能看懂个大概，源码也是导出一个对象把各种方法存放到原型链，我们来看看路由的使用：
```js
const Router = require('zmoa-router')
const router = new Router()

router.get('/', (ctx, next) => {
  ctx.body = "初始页"
})


router.get('/index', (ctx, next) => {
  ctx.body = "首页"

  next()


})


//初始路由
app.use(router.routes())


app.listen(3000, '127.0.0.1')
```

分析一下，引入`zmoa-router`模块，然后实例化，第一步初始化路由也是至关重要的一步，贴代码简易路由：
```js

class Router {
    constructor() {
        this.stack = [] //储存每个路由的方法对象
    }

    //注册路由
    register(path, method, fn) {
        let route={
            path, 
            method, 
            fn
        }

        this.stack.push(route)
    }

    // get方法
    get(path,fn){
        this.register(path,'get',fn)
    }

    // post方法
    post(path,fn){
        this.register(path,'post',fn)
    }


    routes(){
       
      // app.use()接收的是一个函数储存到一个数组里面，然后调用中间件
     
        return async (ctx,next)=>{
            let route=null;

            for(let item of this.stack){

                if(ctx.url===item.path && item.method.includes(ctx.method)){
                    route=item.fn
                    break
                }
            }

            if(typeof route ==='function'){
               
                route(ctx,next)
                return 
            }else{
                ctx.body='Not Found'
            }
  
            await next()

        }
    }
}

   
```



