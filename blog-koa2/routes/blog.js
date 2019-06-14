const router = require('koa-router')()
const { getList, getDetail, newBlog, updateBlog, delBlog } = require('../controller/blog')
const { SuccessModel, ErrorModel } = require('../model/resModel')

const loginCheck = require('../middleware/loginCheck')

router.prefix('/api/blog')

router.get('/list', async (ctx, next) => {
    let author = ctx.query.author || ''
    const keyword = ctx.query.keyword || ''

    // 进入管理员页面需要验证用户是否已登录，如果未登录，则禁止进入，如果登录，则显示当前用户的博客列表
    if (ctx.query.isadmin) {
        if (ctx.session.username == null) {
            ctx.body = new ErrorModel('未登录')
            return
        }
        // 如果已登录，只显示自己的博客
        author = ctx.session.username
    }

    const listData = await getList(author, keyword)
    ctx.body = new SuccessModel(listData)
})


router.get('/detail', async (ctx, next) => {
    const id = ctx.query.id
    const data = await getDetail(id)

    ctx.body = new SuccessModel(data)
})

// 新建blog, 通过中间件进行登录验证
router.post('/new', loginCheck, async (ctx, next) => {
    // 注意，这里是post请求提交的数据，需要用 ctx.request.body ， 不是 ctx.body，因为ctx.body 是返回数据时的写法
    ctx.request.body.author = ctx.session.username // 如果前面已经登录过，这里可以直接从 session 中获得username

    const data = await newBlog(ctx.request.body)
    ctx.body = new SuccessModel(data)
})

router.post('/update', loginCheck, async (ctx, next) => {
    const id = ctx.query.id
    const result = await updateBlog(id, ctx.request.body)

    if (result) {
        ctx.body = new SuccessModel('更新成功')
    } else {
        ctx.body = new ErrorModel('更新失败')
    }
})

router.post('/del', loginCheck, async (ctx, next) => {
    const author = ctx.session.username
    const id = ctx.query.id
    const result = await delBlog(id, author)

    if (result) {
        ctx.body = new SuccessModel('删除成功')
    } else {
        ctx.body = new ErrorModel('删除失败')
    }
})

module.exports = router
