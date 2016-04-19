# 设置npm镜像
由于直接访问npm，可能会很慢，甚至会出现链接中断，所以我们需要设置npm镜像，这样下载就会快些，执行以下命令来设置

```
npm config set registry https://registry.npm.taobao.org 
```

# 运行项目
需安装最新版的node.js
```
npm install -g gulp
```

在项目根目录下运行
```
npm install
```
# 启动服务
```
gulp serve
```