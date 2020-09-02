
const delegator = require('../utils/delegator')

const proto = module.exports = {

}

delegator(proto, 'request')
    .access('url')
    .access('method')
   

delegator(proto, 'response')
    .access('body')
    .setter('headers')


