
function compose(arr) {

    return ctx => {
        let index = -1

        function dispatch(i) {
            const fn = arr[i]
           
            //防止一个中间件里面存在重复的 next
            if (i <= index) return Promise.reject(new Error('next() called multiple times'));
            index = i;
            if (!fn) return Promise.resolve();

            try {
                return Promise.resolve(fn(ctx, () => dispatch(i + 1)))
            } catch (error) {
              
                return Promise.reject(error)
            }
        }

        return dispatch(0)
    }
}


module.exports = compose
