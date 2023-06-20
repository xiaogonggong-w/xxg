# 这是一个可以切换npm镜像源的工具
# 安装
```
npm i xxg -g

```

# 使用
## ls
```
xxg ls

```
查看所有的镜像源

## use
```
xxg use taobao -l  或者 xxg use taobao -g
```

使用淘宝源

## add

```
xxg add
```
添加镜像源

## del

```
xxg del
```

删除镜像源

## current
```
xxg current
```
查看当前镜像源

## ping
```
xxg ping taobao
```

测试淘宝源的的响应时间

## 所有命令
Options:
  -V, --version             output the version number
  -h, --help                display help for command

Commands:
  ls                        查看所有可用的源
  use [options] <registry>  切换到具体的源,options环境配置有-l(--local)和-g(--global), 默认-g
  add                       添加一个新的源
  del <registry>            删除一个源
  current                   查看当前的源
  ping [registry]           测试源的速度，默认当前的源（也可以选择）
  help [command]            display help for command