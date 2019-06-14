# 初始化项目

$ npm init


# 安装依赖

跨平台设置

```
$ npm install cross-env --save-dev
```

安装nodemon

```
$ npm install nodemon --save-dev
```

# package.json 文件配置

```
{
  "name": "blog-1",
  "version": "1.0.0",
  "description": "",
  "main": "bin/www.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "cross-env NODE_ENV=dev nodemon ./bin/www.js",
    "prd": "cross-env NODE_ENV=production nodemon ./bin/www.js"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "cross-env": "^5.2.0",
    "mysql": "^2.17.1",
    "nodemon": "^1.19.1",
    "redis": "^2.8.0",
    "xss": "^1.0.6"
  }
}

```

# 文件目录

```
启动入口：./bin/www.js
业务逻辑配置： ./app.js
```


```
路由层：/src/router/    只处理路由相关，不管数据怎么样
数据层：/src/controller/    处理数据，对接数据库
接口返回的数据模型：/src/model/

开发环境和线上环境 的数据库和redis 配置：/src/conf/db.js

统一处理 sql 语句： /src/db/mysql.js
统一处理 redis get set ： /src/db/redis.js
```


# 返回code

```
请求成功：errno = 0
请求失败：errno = -1
```


# cookie session token redis

Http 协议是一个无状态协议, 客户端每次发出请求, 请求之间是没有任何关系的。但是当多个浏览器同时访问同一服务时，服务器怎么区分来访者哪个是哪个呢？

cookie、session、token 就是来解决这个问题的。

## cookie

- cookie 仅仅是浏览器实现的一种数据存储功能，就是浏览器里面能永久存储的一种数据
- 浏览器每次发生http请求，都会将请求域的 cookie 一同发给 server 端
- server 端可以修改 cookie 并返回给浏览器
- 浏览器端也可以通过 js 修改 cookie, 但是是有限制的，例如记录用户登录数据的某些 cookie 是禁止浏览器端随意修改的
- node 解析 cookie：

```
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
```


## session

如果说 cookie 是客户身上的“通行证”，那么 session 就是服务器上的“客户明细表”。客户第一次访问服务器，服务器会保存客户的信息，并给客户一个 cookie，下一次客户携带 cookie 访问服务器时，服务器会通过该 cookie 在客户明细表（session）中找出该用户信息，服务器就知道是哪个在访问了。

- session 只保存在服务器上，是服务器端使用的一种记录客户端状态的机制
- session 的使用方式是：客户端 cookie 里存 userid，服务端 session 存用户数据，客户端访问服务端的时候，根据 userid 找对应用户数据


## token

token 也称作令牌, 注意在客户端里存 userid（也就是token）、用户信息、密文，而服务端只有一段加密代码，用来判断当前加密后的密文是否和客户端传递过来的密文一致，如果不一致，就是客户端的用户数据被篡改了，如果一致，就代表客户端的用户数据正常且正确。

token 在客户端一般存放于localStorage，cookie，或sessionStorage中。在服务器一般存于数据库中。token 组成：

```
· uid: 用户唯一身份标识
· time: 当前时间的时间戳
· sign: 签名, 使用 hash/encrypt 压缩成定长的十六进制字符串，以防止第三方恶意拼接
· 固定参数(可选): 将一些常用的固定参数加入到 token 中是为了避免重复查库
```

token 认证流程与 cookie 类似：

```
1. 用户登录，成功后服务器返回Token给客户端。
2. 客户端收到数据后保存在客户端
3. 客户端再次访问服务器，将 token 放入 headers 中
4. 服务器端校验。校验成功则返回请求数据，校验失败则返回错误码（401）
```


## redis：

### redis 和 mysql 区别

- redis 是 web server 最常用的`缓存数据库`，数据存放在`内存`中, 可存储的数据量较小，但是读取速度较快
- 相比于 mysql, mysql 是`关系型数据库`，存储在`硬盘`中，可存储的数量较大，但是读取速度较慢
- redis 和 mysql 一般配合使用

### 为何 session 或 token 更适合存储在 redis

- session 或 token 访问频繁，对性能要求极高
- session 或 token 不必但是丢失数据（丢失后，用户只需要重新登录即可）
- 与其他存储在 mysql 中的数据相比，session 或 token 的数据量较小


### 为何其他网站数据不适合存储在 redis

- 防止数据丢失
- 数据量大，内存成本高
- 操作频率不高




# nginx 命令

- 测试配置文件格式是否正确：$ nginx -t
- 启动：nginx
- 重启：nginx -s reload
- 获取nginx进程号: ps -ef|grep nginx
- 停止进程(master): Kill -TERM 22649(进程号)
- 关闭: nginx -s quit  （优雅停止）
- 关闭: nginx -s stop  （立即停止）


## nginx 反向代理（Mac os下）

例如，有两个目录，一个目录下是前端html文件，服务监听的端口是8001；另一个是后端nodejs文件，服务监听的是8000端口。
当浏览器访问 localhost:8888,  然后被nginx 监听后，如果匹配到localhost:8080/...，直接会代理到 8081 端口 html 文件中；如果匹配到localhost:8080/api/...，则会代理到 8000端口的node.js文件中。


打开：/usr/local/etc/nginx/nginx.conf

然后在 nginx 的 http 模块上添加一个 server

```
 server {
    listen        8888;

    location / {
        proxy_pass: http://localhost:8001;
    }

    location /api/ {
        proxy_pass: http://localhost:8000;
        proxy_set_header Host $host;
    }
}
```


# 日志功能


node.js 使用 stream 提高性能

把文件比作装水的桶，而水就是文件里的内容，我们用一根管子(pipe)连接两个桶使得水从一个桶流入另一个桶，这样就慢慢的实现了大文件的复制过程。

## stream 管道读写操作 -- 复制文件

```
const fs = require('fs')
const path = require('path')

const fileName1 = path.resolve(__dirname, 'data.txt')
const fileName2 = path.resolve(__dirname, 'copy.txt')

// 创建一个可读流, 读取原文件的 stream 对象
const readStream = fs.createReadStream(fileName1)

// 创建一个可写流, 写入文件的 stream 对象
const writeStream = fs.createWriteStream(fileName2, {
    flags: 'a'  // 追加写入, 覆盖用 'w'
})

// 管道读写操作
// 读取 input.txt 文件内容，并将内容写入到 output.txt 文件中
readStream.pipe(writeStream)

// 逐渐的打印被读取的文件， 直到全部读取完成
readStream.on('data', chunk => {
    console.log(chunk.toString())
})

// 读取完成后执行
readStream.on('end', () => {
    console.log('全部复制完成')
})
```



## 日志分析 readline

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


