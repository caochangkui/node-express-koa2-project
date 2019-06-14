const xss = require('xss')
const { exec } = require('../db/mysql')


const getList = (author, keyword) => {
    // 注意，为防止author 或 keyword 为空，后面加上 1=1 ，可以防止 sql 语句报错
    // 注意，每个 sql 片段后面的空格
    let sql =  ` select * from blogs where 1=1 `
    if (author) {
        sql += `and author='${author}' `
    }
    if (keyword) {
        sql += `and title like '%${keyword}%' `
    }
    sql += `order by createtime desc;`

    // 返回 promise
    return exec(sql)

    /**
     *  注意：return exec(sql) 相当于：
        return exec(sql).then(rows => {
            return rows
        })
     */
}

const getDetail = (id) => {
    const sql = `select * from blogs where id='${id}';`
    return exec(sql).then(rows => {
        return rows[0]
    })
}

const newBlog = (blogData = {}) => {
    // blogData 是一个博客对象，包含 title content 等属性
    const title = xss(blogData.title) // xss 防止攻击
    const content = xss(blogData.content)
    const author = blogData.author
    const createtime = Date.now()

    const sql = `
        insert into blogs (title, content, createtime, author)
        values ('${title}', '${content}', '${createtime}', '${author}');
    `
    console.log('新增博客内容：',blogData)

    return exec(sql).then(insertData => {
        console.log('插入数据：', insertData)
        return {
            id: insertData.insertId
        }
    })

}

const updateBlog = (id, blogData = {}) => {
    console.log('更新博客id：',id)
    console.log('更新博客内容：',blogData)

    const title = xss(blogData.title)
    const content = xss(blogData.content)

    const sql = `
        update blogs set title='${title}', content='${content}' where id=${id};
    `
    return exec(sql).then(updateData => {
        console.log('更新数据：', updateData)
        if (updateData.affectedRows > 0) {
            return true
        }
        return false
    })
}

const delBlog = (id, author) => {
    const sql = `delete from blogs where id=${id} and author='${author}';`
    console.log(sql)
    return exec(sql).then(delData => {
        console.log('删除数据：', delData)
        if (delData.affectedRows > 0) {
            return true
        }
        return false
    })
}


module.exports = {
    getList,
    getDetail,
    newBlog,
    updateBlog,
    delBlog
}