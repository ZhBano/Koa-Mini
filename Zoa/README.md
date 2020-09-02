## zmoa发展过程
`zmoa`是通过阅读源码自己写的一个mini-koa，便于学习

## Hello zmoa


```js
const Zmoa = require('zmoa');
const app = new Zmoa();

app.use((ctx,next) => {
  ctx.body = 'Hello zmoa';
});

app.listen(3000, '127.0.0.1')
```

## 设置路由
```js
npm i zmoa-router
```
使用方法：
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