const { ErrorModel } = require('../model/resModel')

module.exports = async (ctx, next) => {
    if (ctx.session.username) {
        // 登陆成功，需执行 await next()，以继续执行下一步
        await next()
        return
    }
    // 登陆失败，禁止继续执行，所以不需要执行 next()
    ctx.body = new ErrorModel('尚未登录 - blog-koa2')
}