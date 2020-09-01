const Zoa =require('./Zoa/application')

let app = new Zoa()
app.use((ctx,next) => {
  console.log('1 start')
  ctx.body='11'
  next()

  console.log('1 end')
})

app.use((ctx,next) => {
  // console.log('2 start')
  ctx.body+='222'
  next()

  // console.log('2 end')
})


app.listen(3000, '127.0.0.1')