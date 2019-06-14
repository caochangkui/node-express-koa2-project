const { getList, getDetail, newBlog, updateBlog, delBlog } = require('../controller/blog')
const { SuccessModel, ErrorModel } = require('../model/resModel')


// 统一验证是否登录的函数
const loginCheck = (req) => {
    // 验证 session
    console.log('====== 统一验证req.session ======= ', req.session)
    if (!req.session.username) {
        return Promise.resolve(new ErrorModel('尚未登录'))
    }
}


// 博客增删改查接口
const handleBlogRouter = (req, res) => {
    const method = req.method

    // 获取博客列表 接口
    if (method === 'GET' && req.path === '/api/blog/list') {
        // 通过 app.js 定义的 req.query 拿到传入的参数
        let author = req.query.author || ''
        const keyword = req.query.keyword || ''

        // 进入管理员页面需要验证用户是否已登录，如果未登录，则禁止进入，如果登录，则显示当前用户的博客列表
        if (req.query.isadmin) {
            const loginCheckResult = loginCheck(req)
            if (loginCheckResult) {
                return loginCheckResult
            }

            // 如果已登录，只显示自己的博客
            author = req.session.username
        }

        const result = getList(author, keyword)
        return result.then(listData => new SuccessModel(listData))
    }

    // 获取博客详情 接口
    if (method === 'GET' && req.path === '/api/blog/detail') {
        const id = req.query.id
        const result = getDetail(id)

        return result.then(data => {
            return new SuccessModel(data)
        })
    }

    // 新建博客 接口
    if (method === 'POST' && req.path === '/api/blog/new') {

        // 验证是否登录
        const loginCheckResult = loginCheck(req)
        if (loginCheckResult) {
            // 未登录
            console.log('--------- 新建博客 尚未登录 -----------')
            return loginCheckResult
        }

        req.body.author = req.session.username // 如果前面已经登录过，这里可以直接从 session 中获得username
        const result = newBlog(req.body) // req.body 在 app.js 的 serverHandle 中定义

        return result.then(data => {
            return new SuccessModel(data)
        })
    }

    // 更新博客 接口
    if (method === 'POST' && req.path === '/api/blog/update') {

        // 验证是否登录
        const loginCheckResult = loginCheck(req)
        if (loginCheckResult) {
            // 未登录
            console.log('--------- 更新博客 尚未登录 -----------')
            return loginCheckResult
        }

        const id = req.query.id
        const result = updateBlog(id, req.body)

        return result.then(val => {
            if (val) {
                return new SuccessModel('更新成功')
            } else {
                return new ErrorModel('更新失败')
            }
        })
    }

    // 删除博客 接口
    if (method === 'POST' && req.path === '/api/blog/del') {

        // 验证是否登录
        const loginCheckResult = loginCheck(req)
        if (loginCheckResult) {
            // 未登录
            console.log('--------- 删除博客 尚未登录 -----------')
            return loginCheckResult
        }

        author = req.session.username
        const id = req.query.id
        const result = delBlog(id, author)

        return result.then(val => {
            if (val) {
                return new SuccessModel('删除成功')
            } else {
                return new ErrorModel('删除失败')
            }
        })
    }
}


module.exports = handleBlogRouter





