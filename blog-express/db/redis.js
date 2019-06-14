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

module.exports = {
    redisClient
}