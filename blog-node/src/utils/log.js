const fs = require('fs')
const path = require('path')

// 生成 write Stream
function createWriteStream(fileName) {
    const fullFileName = path.join(__dirname, '../', '../', 'logs', fileName)
    const writeStream = fs.createWriteStream(fullFileName, {
        flags: 'a'
    })
    return writeStream
}

// 写访问日志
const accessWriteStream = createWriteStream('access.log')

// 写错误日志
const errorWriteStream = createWriteStream('error.log')

// 写事件日志
const eventWriteStream = createWriteStream('event.log')


// 写日志， log就是日志内容
function access(log) {
    accessWriteStream.write(log + '\n')
}

// 写日志， log就是日志内容
function error(log) {
    errorWriteStream.write(log + '\n')
}

// 写日志， log就是日志内容
function event(log) {
    eventWriteStream.write(log + '\n')
}

module.exports = {
    access,
    error,
    event
}



