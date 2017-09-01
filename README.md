# 前端开发文档

#开发流程：
    
    拉代码, npm install 安装依赖包
    
    执行npm run localhost 访问 localhost:8086

    npm run build 构建本地dist目录代码（未压缩，未加hash）
    npm run build:remote 构建静态资源目录代码（压缩，加hash）
    

    npm run build:dll 预编译第三方库——》上传lib目录——》修改index.html的dll.js引入

    npm run deploy：代码压缩到yzb_static ——》 上传 ——》更新htmlhash【tips:涉及服务器，demo未开放】

    数据来自mockjs
    
#测试：


## 一，技术需求

1. [vue >2.x](https://cn.vuejs.org/)  "Javascript库"
2. [webpack](https://webpack.github.io/  or https://doc.webpack-china.org)    "模块加载及打包"
3. [element UI 1.2.9](http://element.eleme.io/#/zh-CN) "UI组件库及设计语言"
4. [es6](http://es6.ruanyifeng.com/)  "开发语言"


## 二，项目文件结构

### 1, 主体结构

.static
├── .babelrc                # Babel配置文件
├── .editorconfig           # 编辑器通用配置
├── .eslintrc               # eslint 编码规范检测规则
├── README.md               # 本文档
├── config                  # webpack配置文件库（由webpack.config.js调用）
├── dist                    # 编译，本地打包后输出目录local
├── yzb_static              # 编译，本地打包后输出目录上传静态资源remote
├── package.json            # npm配置信息，项目依赖关系均在此文件内
├── build                   # webpack相关配置 及 本地开发服务器启动文件
├── src                     # 业务源码目录
└── tests                   # 业务源码测试代码目录
```
### 2, 业务源码结构

.src
  ├── assets                # 公共资源目录（图片，字体等）
  ├── components            # 组件目录
  ├── entries               # 入口文件目录
  ├── pages                 # 页面文件目录
  ├── router                # 路由文件目录
  └── views                 # html模版目录
 ```
> 说明：<br>
> 1，入口文件目录，页面文件目录及路由文件目录具有一定的关联性，即一个入口文件对应一个路由文件,一个路由文件对应一个页面文件 。<br>
> 2, service目录用来存放所有的与服务器端异步请求的方法，该处的文件组织形式，根据后端接口文档来编写。

#### 2.1 组件结构
```shell
.components
  ├── Login                 # 组件名称，名称使用帕斯卡命名
  │   ├── Login.jsx         # 组件jsx文件，文件名称保持一致
  │   └── Login.less        # 组件样式文件，文件名称保持一致
  └── 其它组件....
```
### 3, webpack配置
```shell
.config
  ├── index.js               # 基础配置
  ├── defaultOpt.js         # 默认配置，定义了默认插件，入口文件，Module
  ├── dev.js                # 在基础配置的基础上，设置webpack-dev-server,配置模块热加载
  └── dist.js               # 在基础配置的基础上，增加编译打包的相关配置
```
> 说明：<br>
> package.json 已经配置的script命令
```shell
-> npm run dev               # 启动本地开发服务器
-> npm run build             # 清除dist目录下所有文件，编译，打包
-> npm run build:remote      # 清除yzb_staitc目录下所有文件，编译，打包 ，压缩，hash，上传
-> npm run hash              # 替换index的hash值
-> npm run upload            # 上传yzb_staitc目录代码到服务器
-> npm run deploy            #  npm run build:remote  + npm run upload
-> npm run build:dll         # 第三方库预先编译
```

## 三，编码规范

### 1, Javascript版本
Javascript采用ES6版本及ES7阶段2以上的特性。

### 2, Javascript及Vue编码规范
上述编码规范参见[Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)及[Airbnb React/JSX Style Guide](https://github.com/airbnb/javascript/tree/master/react)。
### 3, CSS编码规范




ps:【涉及服务器等原项目资料，demo未开放，且gulp任务需修改才能适应自身项目】
