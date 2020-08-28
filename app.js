const Zoa =require('./Zoa/application')

let app = new Zoa()
app.use((ctx,next) => {
  console.log('1 start')
  next()

  console.log('1 end')
})

app.use((ctx,next) => {
  console.log('2 start')

  next()

  console.log('2 end')
})


app.listen(3000, '127.0.0.1')