var createError = require('http-errors');
var express = require('express');
var path = require('path');
var fs = require('fs')
var cookieParser = require('cookie-parser'); // 中间件，处理 cookie
var logger = require('morgan'); // 中间件，生成日志

const session = require('express-session')
const RedisStore = require('connect-redis')(session)

var blogRouter = require('./routes/blog');
var userRouter = require('./routes/user');

var app = express();

// 前端视图引擎设置，对于前后端分离项目，不需要
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// 处理日志
const ENV = process.env.NODE_ENV
if (ENV !== 'production') {
  // 如果是开发环境 / 测试环境，则直接在控制台终端打印 log 即可
  app.use(logger('dev'));
} else {
  // 如果当前是线上环境，则将日志写入/logs/access.log文件中
  const logFileName = path.join(__dirname, 'logs', 'access.log')
  const writeStream = fs.createWriteStream(logFileName, {
    flags: 'a'
  })
  app.use(logger('combined', {
    stream: writeStream
  }))
}


// 处理 post 请求的 json 数据，此方法支持Express4.16.0+ 的版本，用于取代 body-parser
app.use(express.json());
// 处理 post 请求的 urlencoded 数据(例如 form 表单数据)，支持Express4.16.0+ 的版本
app.use(express.urlencoded({ extended: false }));
// 处理 cookie
app.use(cookieParser());
// 处理前端静态文件，对于前后端分离项目，不需要
app.use(express.static(path.join(__dirname, 'public')));

// 配置 session cookie
const redisClient = require('./db/redis').redisClient
const sessionStore = new RedisStore({
  client: redisClient
})
app.use(session({
  resave: true, //添加 resave 选项
  saveUninitialized: true, //添加 saveUninitialized 选项
  secret: '随意', // 和cryp.js密匙类似，可以随意添加，建议由大写+小写+加数字+特殊字符组成
  cookie: {
    path: '/', // 默认配置
    httpOnly: true, // 默认配置，只允许服务端修改
    maxAge: 24 * 60 * 60 * 1000 // cookie 失效时间 24小时
  },
  store: sessionStore  // 将 session 存入 redis
}))

// 等以上各项解析完成后，开始处理下面的路由
app.use('/api/blog', blogRouter);
app.use('/api/user', userRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
// 错误处理
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  // 只有在开发环境下，如果出现错误，就在页面中显示出来
  res.locals.error = req.app.get('env') === 'env' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
