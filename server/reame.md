## 安装express
$ npm install express --save

## 安装nodemon ，避免每次修改server.js后都要手动执行  node server.js, 安装后只需执行一次nodemon server.js 即可
$ npm install nodemon -g

## 安装 MongoDB
$   cd "$(brew --repo)"
    git remote set-url origin https://mirrors.tuna.tsinghua.edu.cn/git/homebrew/brew.git

    cd "$(brew --repo)/Library/Taps/homebrew/homebrew-core"
    git remote set-url origin https://mirrors.tuna.tsinghua.edu.cn/git/homebrew/homebrew-core.git

    brew update

$   brew install mongodb

## 安装 mongoose

$ npm isntall mongoose -save