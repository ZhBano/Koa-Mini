## 前言

本文是我在阅读 Koa 源码以及参考别的文章后实现迷你版 Koa的过程 ，当你阅读源码后其实实现一个迷你版的 Koa 不会很难。

本文会循序渐进的解析内部原理，包括：

1. 基础版本的 koa
2. context 的实现
3. 中间件原理及实现

## 文件结构
- `application.js`: 入口文件，里面包括我们常用的 use 方法、listen 方法以及对 ctx.body 做输出处理

## 基础版本
用法：
```js
const Zoa =require('./Zoa/application')

let app = new Zoa()

// 引用中间件
app.use(ctx => {
  ctx.body = '11111'
})

app.listen(3000, '127.0.0.1')

```

`application.js`:

```js
const http = require('http')
module.exports = class Zoa {
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
