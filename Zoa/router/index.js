class Router {
    constructor() {
        this.stack = []
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

module.exports=Router