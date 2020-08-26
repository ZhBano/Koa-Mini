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



