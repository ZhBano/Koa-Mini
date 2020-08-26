const Zoa =require('./Zoa/application')

let app = new Zoa()
app.use(ctx => {
  ctx.body = '11111'
})

app.listen(3000, '127.0.0.1')