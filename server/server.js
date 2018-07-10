const express = require('express')
const mongoose = require('mongoose')

// 链接Mongo, 并且使用imooc这个集合
const DB_URL = 'mongodb://127.0.0.1:27017/imooc'
mongoose.connect(DB_URL)
mongoose.connection.on('connected', function() {
    console.log('mongo connect success')
})

// 类似于mysql的表， mongo有文档、字段的概念, 下面创建user表，有user和name 两个字段
const User = mongoose.model('user', new mongoose.Schema({
    user: {
        type: String,
        require: true
    },
    age: {
        type: Number,
        require: true
    }
}))

// 新增数据
/* User.create({
    user: 'jack',
    age: 26
}, function(err, doc) {
    if (!err) {
        console.log(doc)
    } else {
        console.log(err)
    }
}) */

// 删除数据
/* User.remove({ // 删除所有age=19的数据
    age:19
},function(err, doc) {
    console.log(doc)
}) */

// 更新数据
User.update({
    'user': 'jack'
}, {
    '$set': {age: 16}
}, function(err, doc) {
    console.log(doc)
})


// 新建app
const app = express()

app.get('/', function(req, res) {
    res.send('<p>this is express</p>')
})
app.get('/data', function(req, res) {
    User.find({}, function(err, doc) { // 查找数据
        res.json(doc)
    })
})
app.listen(9093, function() {
    console.log('node app start at port 9093')
})