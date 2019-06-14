const { ErrorModel } = require('../model/resModel')

module.exports = (req, res, next) => {
    if (req.session.username) {
        // 登陆成功，需执行 next()，以继续执行下一步
        next()
        return
    }
    // 登陆失败，禁止继续执行，所以不需要执行 next()
    res.json(
        new ErrorModel('未登录')
    )
}