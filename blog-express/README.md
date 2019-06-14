基于 express + mysql + redis 搭建多用户博客系统

## 1. 项目地址

[https://github.com/caochangkui/node-express-koa2-project/tree/master/blog-express](https://github.com/caochangkui/node-express-koa2-project/tree/master/blog-express)

## 2. 项目实现

* Express 框架
    - Node 连接 MySQL
    - 路由处理
    - API 接口开发
    - 开发中间件

* 登录
    - Cookie / Session 机制
    - 登录验证中间件开发
    - 使用 Redis 存储 Session

* 数据存储
    - MySQL
    - Redis

* 安全防御
    - SQL 注入
    - XSS 攻击

* Nginx 反向代理

* 日志操作
    - stream 流
    - morgan 处理日志
    - crontab 日志拆分，任务定时
    - readline 逐行分析日志

* 线上环境部署
    - 使用 PM2
    - 进程守护，系统崩溃自启动
    - 启动多进程
    - 线上日志记录


## 3. 项目依赖

使用 express-generator 初始化项目

跨平台环境变量设置：

```
$ npm install cross-env --save-dev
```

安装文件监测工具 nodemon：

```
$ npm install nodemon --save-dev
```

```
"dependencies": {
    "connect-redis": "^3.4.1",
    "cookie-parser": "~1.4.4",
    "debug": "~2.6.9",
    "express": "~4.16.1",
    "express-session": "^1.16.1",
    "http-errors": "~1.6.3",
    "jade": "~1.11.0",
    "morgan": "~1.9.1",
    "mysql": "^2.17.1",
    "redis": "^2.8.0",
    "xss": "^1.0.6"
  },
  "devDependencies": {
    "cross-env": "^5.2.0", // 跨平台环境变量设置
    "nodemon": "^1.19.1"   // 开发环境下,文件监测
  }
```

启动项目：

```
$ npm run dev
```


## 4. 文件目录

```
├── README.md
├── project.json                    // 项目配置文件
├── app.js                          // 项目主文件
├── bin
│   └── www                         // 项目启动入口
├── conf
│   └── db.js                       // mysql和redis配置文件(开发环境和线上环境)
│── controller                      // 数据层
│   ├── blog.js                     // 处理blog数据的增删改查
│   └── user.js                     // 处理user数据, 登录
│── db                              // 数据层
│   ├── mysql.js                    // mysql连接，promise 统一处理sql语句
│   └── redis.js                    // redis连接
│── middleware                      // 存放中间件的目录
│   └── loginCheckt.js              // 登录校验的中间件
│── logs                            // 存放日志的目录
│   │── access.log                  // 访问日志
│   │── error.log                   // 错误日志
│   └── event.log                   // 事件日志
│── model                           // 存放中间件的目录
│   └── resModel.js                 // 统一定义各个接口返回的数据格式
│── public                          // 存放前端静态文件的目录（对于前后端分类的项目不需要）
│── views                           // 前端视图文件目录，对于前后端分离项目，不需要
│── routes                          // 路由层
│   ├── blog.js                     // blog 操作 接口
│   └── user.js                     // user 登录 接口
└── utils                           // 存放中间件的目录
   └── cryp.js                      // cypto 加密处理
```


## 5. Mysql 和 Redis 数据库

#### 环境变量配置

项目从开发、测试、预发布到生成环境(线上)的环境变量一般都是不同的，为避免每次都手动修改，这里先配置环境变量

/conf/db.js:

```
const env = process.env.NODE_ENV // 环境参数

// 配置
let MYSQL_CONF
let REDIS_CONF

// 开发环境下
if (env === 'dev') {
    // mysql 配置
    MYSQL_CONF = {
        host: 'localhost',
        user: 'user',
        password: 'password',
        port: '3306',
        database: 'database'
    }

    // redis 配置
    REDIS_CONF = {
        host: '127.0.0.1',
        port: 6379
    }

// 线上环境时，这里和开发环境配置一样，当发布到线上时，需要将配置改为线上
if (env === 'production') {
    MYSQL_CONF = {
        host: 'localhost',
        user: 'user',
        password: 'password',
        port: '3306',
        database: 'database'
    }

    REDIS_CONF = {
        host: '127.0.0.1',
        port: 6379
    }
}

// 其他环境配置
... ...

module.exports = {
    MYSQL_CONF,
    REDIS_CONF,
}
```

#### MySQL 连接与使用

/db/mysql.js:

```
let mysql = require('mysql')

const { MYSQL_CONF } = require('../conf/db')

let connection = mysql.createConnection(MYSQL_CONF)

connection.connect((err, result) => {
    if (err) {
        console.log("数据库连接失败");
        return;
    }
    console.log("数据库连接成功");
})


// 通过 Promise 统一执行 sql 函数
function exec(sql) {
    return new Promise((resolve, reject) => {
        connection.query(sql, (err, result) => {
            if (err) {
                reject(err)
                return;
            }
            resolve(result)
        })
    })
}

module.exports = {
    exec,
    escape: mysql.escape
}
```

例如：根据 id 查询：

```
const getDetail = (id) => {
    const sql = `select * from blogs where id='${id}';`
    return exec(sql).then(rows => {
        return rows[0]
    })
}

... ...

router.get('/detail', (req, res, next) => {
    const id = req.query.id
    const result = getDetail(id)

    return result.then(data => {
        res.json(
            new SuccessModel(data)
        )
    })
})
```

#### Redis 连接

/db/redis.js:

```
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
```

## 6. 路由处理

/routes/里包含了blog和用户的路由处理。例如：

get请求：

```
router.get('/list', (req, res, next) => {
    let author = req.query.author || ''
    const keyword = req.query.keyword || ''

    const result = getList(author, keyword)
    return result.then(listData => {
        res.json({
            errno: 0,
            listData
        })
    })
})
```

post 请求：

```
router.post('/update', (req, res, next) => {
    const id = req.query.id
    const result = updateBlog(id, req.body)

    return result.then(val => {
        if (val) {
            res.json({
                errno: 0,
                msg: "更新成功"
            })
        } else {
            res.json({
                errno: 0,
                msg: "更新失败"
            })
        }
    })
})
```

### res.send() 和 res.json() 和 res.end() 和 res.set()

express 路由中根据不同的响应头字段，有不同的响应方式：

#### · res.render()

主要用来渲染 views 中的前端模板文件，对于前后端分离的项目，暂时不需要


#### · res.send([body])

用来发送HTTP响应。该body参数可以是一个Buffer对象、字符串、数组或对象。

express 针对不同参数，发出的相应行为也不一样：

- 当参数为 Buffer 对象时，res.send()方法将 Content-Type 响应头字段设置为“application/octet-stream”
- 当参数为 String 时，res.send()方法将 Content-Type 响应头字段设置为“text/html”
- 当参数为 Array 或 Object 对象时，res.send()方法将 Content-Type 响应头字段设置为“application/json”

如下：

```
res.send({name: "cedric"});
header： Content-Type: application/json; charset=utf-8
body：{"name":"cedric"}

res.send(["name","cedric"]);
header： Content-Type: application/json; charset=utf-8
body：["name","cedric"]

res.send('hello world');
header： Content-Type: text/html; charset=utf-8
body：hello world

res.send(new Buffer('abc'));
header：Content-Type: application/octet-stream
body：<Buffer 61 62 63>
```

#### res.json([body])

- 发送一个json的响应, 相当于原生 Node 的: res.end(JSON.stringify(data))
- 将Content-Type 响应头字段设置为： Content-Type: application/json; charset=utf-8
- 该方法res.send()与将对象或数组作为参数相同
- 不过，res.json() 可以将其他值转换为JSON，例如null、undefined、String

#### · res.end()

结束响应过程, 用于快速结束没有任何数据的响应

#### · res.set()

用来设置 header ‘content-type’参数。

```
// 即使res.send 参数是数组或对象，也可以通过res.set()将 Content-Type 响应头字段设置为“text/html”
res.set('Content-Type', 'text/html');
res.send({name: "cedric"});
header： Content-Type: text/html; charset=utf-8
body：'{"name":"cedric"}'


// 即使res.send 参数是字符串，也可以通过res.set()将 Content-Type 响应头字段设置为“application/json”
res.set('Content-Type', 'application/json');
res.send('hello world');
header： Content-Type: application/json; charset=utf-8
body：hello world
```

## 7. 登录, cookie + session 机制

Http 协议是一个无状态协议, 客户端每次发出请求, 请求之间是没有任何关系的。但是当多个浏览器同时访问同一服务时，服务器怎么区分来访者哪个是哪个呢？cookie、session、token 就是来解决这个问题的。详情参考：[https://www.cnblogs.com/cckui/p/10967266.html](https://www.cnblogs.com/cckui/p/10967266.html)

本项目通过 cookie + session 机制处理登录，并通过 Redis 存储 session 数据。

依赖：

```
$ npm i express-session

$ npm i redis connect-redis
```

在 app.js 中配置：

```
··· ···

const session = require('express-session')
const RedisStore = require('connect-redis')(session)

··· ···

// 处理 cookie
app.use(cookieParser());

··· ···

const redisClient = require('./db/redis').redisClient
const sessionStore = new RedisStore({
  client: redisClient
})
app.use(session({
    secret: 'CEdriC_#18603193', // 密匙可以随意添加，建议由大写+小写+加数字+特殊字符组成
    cookie: {
        path: '/', // 默认配置
        httpOnly: true, // 默认配置，只允许服务端修改
        maxAge: 24 * 60 * 60 * 1000 // cookie 失效时间 24小时
    },
    store: sessionStore  // 将 session 存入 redis
}))

```

在 routes/user.js 中 登录路由时，设置 session：

```
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
        }
        res.json(
            new ErrorModel('用户名和密码错误，登录失败')
        )
    })
})
```

### 登录校验 中间件

/middleware/loginCheck.js:

```
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
```

用新增、删除、更改blog时，都需要验证是否登录：

使用示例如下：

```
// 新建blog, 通过中间件进行登录验证
router.post('/new', loginCheck, (req, res, next) => {
    req.body.author = req.session.username
    const result = newBlog(req.body)

    return result.then(data => {
        res.json(
            new SuccessModel(data)
        )
    })
})
```


## 8. 日志处理

一般项目中，在开发环境下，将日志直接打印在控制台记录；生成环境(线上)下，需要将日志写入指定的文件下，如访问日志、错误日志、事件追踪日志等。

express 中主要使用 [morgan](https://github.com/expressjs/morgan#predefined-formats) 中间件处理日志，app.js 文件已经默认引入了改中间件，使用`app.use(logger('dev'))`可以将请求信息打印在控制台，便于开发进行调试，但实际生产环境中，需要将日志记录在logs目录里，可以使用如下代码：


```
var path = require('path');
var fs = require('fs')
var logger = require('morgan'); // 中间件，生成日志

// 处理日志
const ENV = process.env.NODE_ENV
if (ENV !== 'production') {
  // 如果是开发环境 / 测试环境，则直接在控制台终端打印 log 即可
  app.use(logger('dev'));
} else {
  // 如果当前是线上环境，则将请求日志写入/logs/access.log文件中，其他日志（错误日志和事件追踪日志也做类似处理）
  const logFileName = path.join(__dirname, 'logs', 'access.log')
  const writeStream = fs.createWriteStream(logFileName, {
    flags: 'a'
  })
  app.use(logger('combined', {
    stream: writeStream
  }))
}
```

#### 日志分析

- 如：针对日志 access.log，分析 chrome 的占比
- 日志按行存储，一行就是一条日志
- 通过 node.js  readline 进行逐行分析

/utils/readline.js:

```
const fs = require('fs')
const path = require('path')
const readline = require('readline')

// 文件名
const fileName = path.join(__dirname, '../', '../', 'logs', 'access.log')
// 创建 read stream
const readStream = fs.createReadStream(fileName)

// 创建 readline 对象
const rl = readline.createInterface({
    input: readStream
})

let chromeNum = 0
let sum = 0

// 逐行读取
rl.on('line', (lineData) => {
    if (!lineData) {
        return
    }

    // 记录总行数
    sum++

    const arr = lineData.split(' -- ')
    if (arr[2] && arr[2].indexOf('Chrome') > 0) {
        // 累加 chrome 的数量
        chromeNum++
    }
})
// 监听读取完成
rl.on('close', () => {
    console.log(chromeNum, sum)
    console.log('chrome 占比：' + chromeNum / sum)
})
```

## 9. Nginx 反向代理

参考 [https://www.cnblogs.com/cckui/p/10972749.html](https://www.cnblogs.com/cckui/p/10972749.html)

## 10. 安全防御

#### SQL 注入

SQL 注入，一般是通过把 SQL 命令插入到 Web 表单提交或输入域名或页面请求的查询字符串，最终达到欺骗服务器执行恶意的 SQL 命令。


#### SQL 注入预防措施

使用 mysql 的 escape 函数处理输入内容即可

在所有输入 sql 语句的地方，用 escape 函数处理一下即可, 例如：

```
const login = (username, password) => {

    // 预防 sql 注入
    username = escape(username)
    password = escape(password)

    const sql = `
        select username, realname from users where username=${username} and password=${password};
    `

    return exec(sql).then(rows => {
        return rows[0] || {}
    })
}
```
#### XSS 攻击

XSS 是一种在web应用中的计算机安全漏洞，它允许恶意web用户将代码（代码包括HTML代码和客户端脚本）植入到提供给其它用户使用的页面中。

#### XSS 攻击预防措施

转换升级 js 的特殊字符

```
$ npm install xss
```

然后修改：

```
const xss = require('xss')

const title = data.title // 未进行 xss 防御
const title = xss(data.title) // 已进行 xss 防御
```

然后如果在 input 输入框 恶意输入 `<script> alert(1) </script>`, 就会被转换为下面的语句并存入数据库：

`&lt;script&gt; alert(1) &lt;/script&gt;`，已达到无法执行 `<script>` 的目的。

> 注：

更多预防攻击措施可参考：[https://www.cnblogs.com/cckui/p/10990006.html](https://www.cnblogs.com/cckui/p/10990006.html)

## 11. 密码加密

/utils/cryp.js

```
const crypto = require('crypto')

// 密匙
const SECRET_KEY = '这个密钥可以随意填写'

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
```

使用：

```
const { genPassword } = require('../utils/cryp')

const login = (username, password) => {

    // 预防 sql 注入
    username = escape(username)

    // 生成加密密码
    password = genPassword(password)
    password = escape(password)

    const sql = `
        select username, realname from users where username=${username} and password=${password};
    `

    return exec(sql).then(rows => {
        return rows[0] || {}
    })
}
```



## 12. 线上部署与配置：PM2


显示部署通过 PM2, 详情请参考：[https://www.cnblogs.com/cckui/p/10997638.html](https://www.cnblogs.com/cckui/p/10997638.html)
