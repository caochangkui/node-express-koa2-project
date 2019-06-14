const redis = require('redis')
const { REDIS_CONF } = require('../conf/db')

// 创建客户端
const redisClient = redis.createClient(REDIS_CONF.port, REDIS_CONF.host)

redisClient.on('ready', res => {
    console.log('redis启动成功', res)
})

redisClient.on('error', err => {
    console.log('redis启动失败', err)
})

function set (key, value) {
    // 如果 value 是一个对象，需将其转换为 json 字符串保存
    if (typeof value === 'object') {
        value = JSON.stringify(value)
    }
    redisClient.set(key, value, redis.print)
}


function get (key) {
    return new Promise((resolve, reject) => {
        redisClient.get(key, (err, value) => {
            if (err) {
                reject(err)
                return
            }

            if (value == null) {
                resolve(null)
                return
            }

            try {
                // 因为前面set()保存时，将 对象 保存为了 json 字符串，这里get()获取时也需要将其转为 json 对象
                resolve(JSON.parse(value))
            } catch (e) {
                // 如果不是 对象 , 直接返回其值即可
                resolve(value)
            }

        })
    })
}

module.exports = {
    get,
    set
}