# @leizm/config

Node.js 项目配置文件加载器 Config Loader for Node.js Project

## 安装

```bash
npm install @leizm/config --save
```

## 使用

配置文件支持的后缀格式有 `.yaml`、`.yml`、`.json5`、`.json`（本文档以 `.yaml` 为例）。一般文件结构如下：

```text
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

在任何需要用到配置的 JavaScript **文件顶部** 载入 `@leizm/config` 来获取配置，比如：

```typescript
import { Config } from '@leizm/config';

// 创建实例
const config = new Config();

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

+ 配置文件 `config/_development.yaml` 存放本地开发环境所需要的所有配置项
+ 配置文件 `config/development.yaml` 存放不同开发机器在本地开发环境有差异的配置项
+ 启动服务前，使用 `config-loader check _development` 命令以 `_development` 配置文件为基准检查配置文件是否正确，或者在 `pckage.json` 中设置 `check-config` 的脚本：

```json
{
  "scripts": {
    "check-config": "config-loader check _development",
    "start": "npm run check-config && node src/app.js",
    "deploy-production": "NODE_ENV=production && npm run check-config && pm2 restart src/app.js --name Your-Service"
  }
}
```

这样，如果在启动服务器时检查到缺失的配置项即可立即得到相应的反馈信息，而不会继续执行重启服务。

## License

```text
MIT License

Copyright (c) 2017-2018 Zongmin Lei <leizongmin@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
