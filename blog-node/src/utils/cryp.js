const crypto = require('crypto')

// 密匙
const SECRET_KEY = '这个密钥可以随意填写' // 密匙随意添加，建议由大写+小写+加数字+特殊字符组成

// md5 加密
function md5(content) {
    let md5 = crypto.createHash('md5')
    return md5.update(content).digest('hex')
}

// 加密函数
function genPassword(password) {
    const str = `password=${password}&key=${SECRET_KEY}`
    return md5(str)
}


module.exports = {
    genPassword
}