const router = require('koa-router')()

const { login } = require('../controller/user')
const { SuccessModel, ErrorModel } = require('../model/resModel')

router.prefix('/api/user')

router.post('/login', async (ctx, next) => {
    // 注意，这里获取post请求提交的数据需要用 ctx.request.body ， 不是 ctx.body，因为ctx.body 是返回数据时的写法
    const { username, password } = ctx.request.body
    const data = await login(username, password)
    if (data.username) {
        // 登录时 设置 session, 然后被connect-redis同步到redis
        ctx.session.username = data.username
        ctx.session.realname = data.realname

        ctx.body = new SuccessModel('登录成功')
        return
    }
    ctx.body = new ErrorModel('用户名和密码错误，登录失败')
})


module.exports = router
