
# koa2 - 初始化项目

```
$ npm install koa2-generator -g
$ koa2 【blog-koa2】
$ npm install & npm start
```

# 安装依赖

跨平台设置 环境参数

```
$ npm install cross-env --save-dev
```

安装nodemon

```
$ npm install nodemon --save-dev
```

安装mysql xss

```
$ npm install mysql xss
```

# package.json 文件配置

```
···
  "scripts": {
    "start": "node bin/www",
    "dev": "cross-env NODE_ENV=dev ./node_modules/.bin/nodemon bin/www",
    "prd": "cross-env NODE_ENV=production pm2 start bin/www",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
···
```

# 启动项目

在不同环境下的启动方式：

开发环境：npm run dev
生产环境：npm run prd


# 文件目录

```
启动服务入口：./bin/www.js
业务逻辑配置： ./app.js
```

```
路由层：/routes/    只处理路由相关，不管数据怎么样
数据层：/controller/    处理数据，对接数据库
接口返回的数据模型：/model/

开发环境和线上环境 的数据库和redis 配置：/conf/db.js

统一处理 sql redis 语句： /db/
```

# 返回code

```
请求成功：errno = 0
请求失败：errno = -1
```

# 路由

koa2 路由如下， 其中 ctx 就相当于 express 路由中的 req 和 res 的结合体:

- ctx.request.body.name 就相当于 req.body.name
- ctx.request.query 或 ctx.query 相当于 req.query

```
router.prefix('/') // 路由统一的前缀

router.get('/list', async (ctx, next) => {
  const query = ctx.query
  ctx.body = {
    errno: 0,
    query,
    data: [1, 2, 3]
  }
})
```

## 注意

获取 post 请求提交的数据需要用 ctx.request.body ， 不是 ctx.body，因为ctx.body 是返回数据时的写法



```
router.prefix('/api/user')

router.post('/login', async (ctx, next) => {
  const { username, password } = ctx.request.body
  ctx.body = {
    errno: 0,
    username,
    password
  }
})
```


