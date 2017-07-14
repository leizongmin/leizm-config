'use strict';

/**
 * 配置加载器
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

const fs = require('fs');
const path = require('path');
const colors = require('colors');
const createNamespace = require('lei-ns').create;
const json5 = require('json5');
const yaml = require('js-yaml');

// 打印警告信息
function warn(msg) {
  console.log(colors.white('--------------------------------------------------'));
  console.error(colors.red(msg));
  console.log(colors.white('--------------------------------------------------'));
}

// 打印消息被退出
function die(msg, code) {
  warn(msg);
  process.exit(code);
}

// 读取配置文件
function readConfigFile(file, prefix) {
  if (!fs.existsSync(file)) {
    die(`${ prefix }配置文件 ${ file } 不存在！`, 1);
  }
  let data = '';
  try {
    data = fs.readFileSync(file).toString();
  } catch (err) {
    die(`无法读取${ prefix }配置文件 ${ file }！${ err }`, 1);
  }
  const ext = path.extname(file);
  switch (ext) {
  case '.json5':
  case '.json':
    return parseJSON5(file, prefix, data);
  case '.yaml':
  case '.yml':
    return parseYAML(file, prefix, data);
  default:
    die(`不支持的配置文件格式：${ ext }`, 1);
  }
}

// 解析 json5
function parseJSON5(file, prefix, data) {
  try {
    return json5.parse(data);
  } catch (err) {
    const position = `第${ err.lineNumber }行第${ err.columnNumber }列`;
    const msg = `${ prefix }配置文件 ${ file } 格式不正确！(${ position })\n\n${ err }\n`;
    die(msg, 1);
  }
}

// 解析 yaml
function parseYAML(file, prefix, data) {
  try {
    return yaml.load(data);
  } catch (err) {
    const position = `第${ err.mark.line }行第${ err.mark.column }列`;
    const msg = `${ prefix }配置文件 ${ file } 格式不正确！(${ position })\n\n${ err }\n`;
    die(msg, 1);
  }
}

// 项目工作目录
const projectDir = process.cwd();
// 配置文件目录
const configDir = path.resolve(projectDir, 'config');
// 环境变量
const envs = (process.env.NODE_ENV || '')
              .split(',')
              .map(s => s.trim())
              .filter(s => s);
if (envs.length < 1) {
  die(`请使用环境变量 NODE_ENV=xxx 指定配置名！`);
}

// 获取指定名称的配置文件完整路径，文件后缀优先级： .json5 > .yaml > .js
function resolveConfigFile(name) {
  const exts = [ '.json5', '.json', '.yaml', '.yml' ];
  for (let i = 0; i < exts.length; i++) {
    const f = `${ name }${ exts[i] }`;
    if (fs.existsSync(f)) {
      return f;
    }
  }
  return name;
}

// 加载默认配置
const defaultConfigFile = resolveConfigFile(path.resolve(projectDir, 'config'));
const defaultConfig = readConfigFile(defaultConfigFile, '默认');

// 读取指定环境的配置文件
function readEnvConfig(env) {
  const file = resolveConfigFile(path.resolve(configDir, env));
  const data = readConfigFile(file, env);
  return { file, data };
}

// 加载配置
const config = createNamespace(defaultConfig);
config.files = [ defaultConfigFile ];
envs.forEach(name => {
  const { file, data } = readEnvConfig(name);
  config.merge(data);
  config.files.push(file);
});

// 更改 get()，如果取的配置项不存在则抛出异常
config.__get__ = config.get;
config.get = function (name) {
  const data = this.__get__(name);
  if (typeof data === 'undefined') {
    const msg = `无法获取配置项 ${ name }（未定义或其值为 undefined）`;
    warn(msg);
    throw new TypeError(msg);
  }
  return data;
};

config.check = function (name) {
  config.get(name);
};

config.preCheckFromEnv = function () {
  const envs = arguments.length > 0 ? Array.prototype.slice.call(arguments) : [ '_development' ];
  let list = [];
  for (const env of envs) {
    const { data } = readEnvConfig(env);
    list = list.concat(createNamespace.utils.getLeafs(data));
  }
  const missingList = [];
  for (const item of list) {
    if (!config.has(item)) {
      missingList.push(item);
    }
  }
  if (missingList.length > 0) {
    die(`根据环境 ${ envs.join(', ') } 检查，当前缺少以下配置项（未定义或其值为 undefined）:\n\n${ missingList.map(s => `  ${ s }`).join('\n') }`.trim(), 1);
  }
  return list;
};

// 模块输出
module.exports = config;
