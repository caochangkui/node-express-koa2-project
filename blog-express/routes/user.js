const express = require('express');
const router = express.Router();

const { login } = require('../controller/user')
const { SuccessModel, ErrorModel } = require('../model/resModel')

router.post('/login', function (req, res, next) {
    const { username, password } = req.body
    const result = login(username, password)

    return result.then(data => {
        if (data.username) {

            // 登录时 设置 session, 然后被connect-redis同步到redis
            req.session.username = data.username
            req.session.realname = data.realname

            res.json(
                new SuccessModel('登录成功')
            )
            return
        }
        res.json(
            new ErrorModel('用户名和密码错误，登录失败')
        )
    })
})


module.exports = router;
