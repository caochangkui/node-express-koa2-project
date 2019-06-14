const { login } = require('../controller/user')
const { SuccessModel, ErrorModel } = require('../model/resModel')
const { set } = require('../db/redis')


// 登录接口
const handleUserRouter = (req, res) => {
    const method = req.method

    // 登录 接口
    if (method === 'POST' && req.path === '/api/user/login') {
        const { username, password } = req.body
        const result = login(username, password)

        return result.then(data => {
            if (data.username) {

                // 登录时 设置 session
                req.session.username = data.username
                req.session.realname = data.realname

                // 同步 session 到 redis
                set(req.sessionId, req.session)

                return new SuccessModel('登录成功')
            }
            return new ErrorModel('用户名和密码错误，登录失败')
        })
    }


}


module.exports = handleUserRouter
