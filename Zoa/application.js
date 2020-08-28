const http = require('http')
const compose = require('./utils/compose')
module.exports = class Zoa {
  constructor() {
    this.middleware = [] //储存中间件
  }

  use(fn) {
    if (typeof fn !== 'function') throw new TypeError('middleware must be a function!');
    this.middleware.push(fn)
  }


  listen(...arg) {
    const server = http.createServer(this.callback())
    return server.listen(...arg)
  }

  callback() {
    //处理中间件
    const fn = compose(this.middleware)

    const handleRequest = (req, res) => {
      // 创建上下文
      const ctx = this.createContext(req, res)
      // 调用中间件
      fn(ctx)
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



