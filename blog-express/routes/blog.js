var express = require('express');
var router = express.Router();
const { getList, getDetail, newBlog, updateBlog, delBlog } = require('../controller/blog')
const { SuccessModel, ErrorModel } = require('../model/resModel')

// 注意， '../middleware/loginCheck' 直接导出的函数，所有不需要像上面那样解构 loginCheck
const loginCheck = require('../middleware/loginCheck')


router.get('/list', (req, res, next) => {
    let author = req.query.author || ''
    const keyword = req.query.keyword || ''

    // 进入管理员页面需要验证用户是否已登录，如果未登录，则禁止进入，如果登录，则显示当前用户的博客列表
    if (req.query.isadmin) {
        if (req.session.username == null) {
            res.json(
                new ErrorModel('未登录')
            )
            return
        }
        // 如果已登录，只显示自己的博客
        author = req.session.username
    }

    const result = getList(author, keyword)
    return result.then(listData => {
        res.json(
            new SuccessModel(listData)
        )
    })
})

router.get('/detail', (req, res, next) => {
    const id = req.query.id
    const result = getDetail(id)

    return result.then(data => {
        res.json(
            new SuccessModel(data)
        )
    })
})

// 新建blog, 通过中间件进行登录验证
router.post('/new', loginCheck, (req, res, next) => {
    req.body.author = req.session.username // 如果前面已经登录过，这里可以直接从 session 中获得username
    const result = newBlog(req.body)

    return result.then(data => {
        res.json(
            new SuccessModel(data)
        )
    })
})

router.post('/update', loginCheck, (req, res, next) => {
    const id = req.query.id
    const result = updateBlog(id, req.body)

    return result.then(val => {
        if (val) {
            res.json(new SuccessModel('更新成功'))
        } else {
            res.json(new ErrorModel('更新失败'))
        }
    })
})

router.post('/del', loginCheck, (req, res, next) => {
    const author = req.session.username
    const id = req.query.id
    const result = delBlog(id, author)

    return result.then(val => {
        if (val) {
            res.json(new SuccessModel('删除成功'))
        } else {
            res.json(new ErrorModel('删除失败'))
        }
    })
})

module.exports = router;
