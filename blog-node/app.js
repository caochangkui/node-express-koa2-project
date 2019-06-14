const querystring = require('querystring')

const { get, set } = require('./src/db/redis')
const { access } = require('./src/utils/log')
const handleBlogRouter = require('./src/router/blog')
const handleUserRouter = require('./src/router/user')

// cookie 过期时间 24小时过期
const getCookieExpires = () => {
    const d = new Date()
    d.setTime(d.getTime() + (24 * 60 * 60 * 1000))
    return d.toGMTString()
}

// 用于promise异步处理 post data
const getPostData = (req) => {
    return promise = new Promise((resolve, reject) => {
        // 不是post方法
        if (req.method !== 'POST') {
            resolve({})
            return
        }
        // 不是json格式时
        if (req.headers['content-type'] !== 'application/json') {
            resolve({})
            return
        }

        let postData = ''

        req.on('data', chunk => {
            postData += chunk.toString()
        })

        req.on('end', () => {
            // post data 为空时
            if (!postData) {
                resolve({})
                return
            }

            resolve(JSON.parse(postData))
        })
    })
}


const serverHandle = (req, res) => {
    // 记录 access log
    access(`${req.method} -- ${req.url} -- ${req.headers['user-agent']} -- ${new Date()}`)

    // 设置返回格式为 json
    res.setHeader('Content-type', 'application/json')

    const url = req.url
    req.path = url.split('?')[0] // 将 path 作为 req 的属性，传给 blog.js 和 user.js

    // 解析 query
    req.query = querystring.parse(url.split('?')[1]) // 将 path 作为 req 的属性，传给 blog.js 和 user.js

    // 解析 cookie
    req.cookie = {}
    const cookieStr = req.headers.cookie || ''  // cookie格式为 “key1=value1;key2=value2”
    // 格式化 cookie
    cookieStr.split(';').forEach(item => {
        if (!item) {
            return
        }
        const key = item.split('=')[0].trim()  // 注意清除空格
        const value = item.split('=')[1].trim()
        req.cookie[key] = value
    })


    // 解析 session
    let needSetCookie = false
    let userId = req.cookie.userid
    // 先判断cookie中是否有userid, 如果没有，则初始化一个，并初始化redis中的session
    if (!userId) {
        needSetCookie = true
        userId = `${Date.now()}_${Math.random()}`
        // 初始化 redis 中的 session 值
        set(userId, {})
    }

    // 如果cookie中有userid，则将其直接赋值给 req.session, 以便可以在 /src/router/user.js 中取到
    req.sessionId = userId
    // 获取 session
    get(req.sessionId).then(sessionData => {
        if (sessionData == null) {
            // 初始化 redis 中的 session 值
            set(req.sessionId, {})
            // 设置 session
            req.session = {}
        } else {
            // 设置 session
            req.session = sessionData
        }

        // 解析 get 或 post 请求
        return getPostData(req)
    })
    .then(postData => {
        req.body = postData   // postData 即上面返回的 JSON.parse(postData)，后面既可以通过 req.body 获取 postData
        console.log('req.body：',req.body)

        // 处理blog接口  将 req 和 res 传入
        const blogResult = handleBlogRouter(req, res)

        if (blogResult) {
            blogResult.then(blogData => {
                if (needSetCookie) {
                    res.setHeader('Set-Cookie', `userid=${userId}; path=/; httpOnly; expires=${getCookieExpires()}`)
                    console.log('----blog 页面 req.cookie-----', req.cookie)
                    console.log('----blog 页面 req.session-----', req.session)
                }
                res.end(
                    JSON.stringify(blogData)
                )
            })
            return
        }

        // 处理user接口  将 req 和 res 传入
        const userResult = handleUserRouter(req, res)
        if (userResult) {
            userResult.then(userData => {
                if (needSetCookie) {
                    res.setHeader('Set-Cookie', `userid=${userId}; path=/; httpOnly; expires=${getCookieExpires()}`)
                    console.log('----user 页面 req.cookie-----', req.cookie)
                    console.log('----user 页面 req.session-----', req.session)
                }
                res.end(
                    JSON.stringify(userData)
                )
            })
            return
        }

        // 没有找到已定义的路由  返回 404
        res.writeHead(404, {'Content-type': 'text/plain'})
        res.write('404 Not found \n')
        res.end()
    })

}

module.exports = serverHandle
