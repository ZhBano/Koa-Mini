
const delegator = require('./utils/delegator')

const proto = module.exports = {

}

delegator(proto, 'request')
    .access('url')
    .access('path')
   

delegator(proto, 'response')
    .access('body')

