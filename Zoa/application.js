const http = require('http')
const compose = require('./utils/compose')
const request =require('./request')
const response =require('./response')
const context =require('./context')

module.exports = class Zoa {
  constructor() {
    this.middleware = [] //储存中间件
    this.context=Object.create(context)
    this.request=Object.create(request)
    this.response=Object.create(response)
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
      return this.handleRequest(ctx,fn)
    }
    return handleRequest
  }


  //创建上下文
  createContext(req, res) {
    const ctx=Object.create(this.context)
    ctx.request=Object.create(this.request)
    ctx.response=Object.create(this.response)

    ctx.req=ctx.request=req
    ctx.res=ctx.response=res
  

    return ctx

  }


  handleRequest(ctx,fn){

    return fn(ctx).then(_=>this.respond(ctx)).catch(err=>{
      ctx.res.end(err.toString())
    })

  }


  respond(ctx){
    let res=ctx.res;
    let body=ctx.body;
    return res.end(body)
  }
}


