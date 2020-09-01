## zmoa发展过程
`zmoa`是通过阅读源码自己写的一个mini-koa，便于学习

## Hello zmoa


```js
const Zmoa = require('zmoa');
const app = new Zmoa();

app.use(ctx => {
  ctx.body = 'Hello zmoa';
});

app.listen(3000, '127.0.0.1')
```