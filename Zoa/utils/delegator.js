
/**
 * @param {Object} proto 被代理对象
 * @param {String} property 被代理对象上的被代理属性
 * @param {String} name
 */

class Delegator {
    constructor(proto, property) {
        this.proto = proto;
        this.property = property
    }

    // 初始化 
    init(proto, property) {

        return new Delegator(proto, property);

    }



    // 获取被代理对象
    getter(name) {

        let proto = this.proto
        let property = this.property

        proto.__defineGetter__(name, function () {

            return this[property][name];
        });
        return this

    }


    // 修改被代理对象
    setter(name) {
        let proto = this.proto
        let property = this.property

        proto.__defineSetter__(name, function (val) {

            return this[property][name] = val;

        });


        return this
    }


    // 包含 getter 与 setter 的功能
    access(name) {
        return this.setter(name).getter(name)
    }


    // 代理方法
    method(name) {
        let proto = this.proto
        let property = this.property

        proto[name] = function () {
            return proto[property][name].apply(proto[property], arguments)
        }
    }
}


module.exports = new Delegator().init
