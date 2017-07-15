# @leizm/config-loader
Node.js 项目配置文件加载器 Config Loader for Node.js Project

## 安装

```bash
$ npm install @leizm/config-loader --save
```

## 使用

配置文件支持的后缀格式有 `.yaml`、`.yml`、`.json5`、`.json`（本文档以 `.yaml` 为例）。一般文件结构如下：

```
.
├── config                   各环境配置目录
│   ├── _development.yaml    开发环境配置文件
│   ├── development.yaml     开发环境配置文件 *
│   ├── production.yaml      production环境配置文件 *
│   ├── beta.yaml            beta环境配置文件 *
│   └── test.yaml            test环境配置文件 *
├── config.yaml              默认配置文件
├── node_modules             依赖模块目录
└── src                      项目源码目录
```

说明：说明后面带有 `*` 的文件不加入代码版本库中。`.gitignore` 文件可以加入以下规则：

```.gitignore
/config/*.*
!/config/_*.*
```

启动项目时，通过 `NODE_ENV` 环境变量来指定当前的执行环境，支持多个环境名称（是用逗号分隔），比如：`NODE_ENV=_development,development` 表示
首先加载 `config.yaml`（无论指定什么环境名称，都会首先加载此默认配置文件），再加载 `config/_development.yaml`，最后加载 `config/development.yaml`。
如果配置项有冲突，则后加载的会覆盖前加载的配置项，比如：

文件 `_development.yaml`：
```yaml
obj:
  a: 123
  b: 456
```

文件 `development.yaml`：

```yaml
obj:
  b: 000
  c: 789
```

则最终的配置为：

```yaml
obj:
  a: 123
  b: 000
  c: 789
```

在任何需要用到配置的 JavaScript **文件顶部** 载入 `@leizm/config-loader` 来获取配置，比如：

```javascript
const config = require('@leizm/config-loader');

// 获取配置
config.get('obj');
// => { a: 123, b: 000, c: 789 }
config.get('obj.a');
// => 123
config.all();
// => { obj: { a: 123, b: 000, c: 789 } }
config.get('xyz');
// => throw Error()

// 设置配置
config.set('obj.d', 666);

// 检查配置项是否存在
config.has('obj.a');
// => true
config.has('obj.xxx');
// => false
```

需要注意的是，如果通过 `config.get()` 获取一个不存在的配置项（判断依据为该值是否为 `undefined`），则会打印出相应的提示信息，**并且会导致进程退出**。

为了避免进程因为使用到了不存在的配置项而导致进程意外退出，建议：

+ ``
+ 启动服务前，使用 `config-loader check` 命令检查配置文件是否正确，或者在 `pckage.json` 中设置 `check-config` 的脚本：

```json
{
  "scripts": {
    "check-config": "config-loader check _development",
    "start": "npm run check-config && node src/app.js"
  }
}
```



