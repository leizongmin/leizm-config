/**
 * 配置加载器
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import * as fs from 'fs';
import * as path from 'path';
import * as json5 from 'json5';
import * as yaml from 'js-yaml';
const createNamespace = require('lei-ns').create;

/**
 * 读取配置文件
 *
 * @param file 文件名
 * @param prefix 描述
 */
export function readConfigFile(file: string, prefix: string): any {
  if (!fs.existsSync(file)) {
    throw new Error(`${ prefix } 配置文件 ${ file } 不存在！`);
  }
  let data = '';
  try {
    data = fs.readFileSync(file).toString();
  } catch (err) {
    throw new Error(`无法读取 ${ prefix } 配置文件 ${ file }！${ err }`);
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
    throw new Error(`不支持的配置文件格式：${ ext }`);
  }
}

/**
 * 解析 json5
 *
 * @param file 文件名
 * @param prefix 描述
 * @param data 要解析的数据
 */
export function parseJSON5(file: string, prefix: string, data: string): any {
  try {
    return json5.parse(data);
  } catch (err) {
    const position = `第 ${ err.lineNumber } 行第 ${ err.columnNumber } 列`;
    const msg = `${ prefix } 配置文件 ${ file } 格式不正确！(${ position })\n\n${ err }\n`;
    throw new Error(msg);
  }
}

/**
 * 解析 yaml
 *
 * @param file 文件名
 * @param prefix 描述
 * @param data 要解析的数据
 */
export function parseYAML(file: string, prefix: string, data: string): any {
  try {
    return yaml.load(data);
  } catch (err) {
    const position = `第 ${ err.mark.line } 行第 ${ err.mark.column } 列`;
    const msg = `${ prefix } 配置文件 ${ file } 格式不正确！(${ position })\n\n${ err }\n`;
    throw new Error(msg);
  }
}

/**
 * 获取指定名称的配置文件完整路径，文件后缀优先级： .json5 > .yaml > .js
 *
 * @param name 配置名称（文件路径，不包含后缀）
 */
export function resolveConfigFile(name: string): string {
  const exts = [ '.json5', '.json', '.yaml', '.yml' ];
  for (const ext of exts) {
    const f = `${ name }${ ext }`;
    if (fs.existsSync(f)) {
      return f;
    }
  }
  return name;
}

/**
 * 读取指定环境的配置文件
 *
 * @param env 环境名称
 */
export function readEnvConfig(configDir: string, env: string): { file: string, data: any } {
  const file = resolveConfigFile(path.resolve(configDir, env));
  const data = readConfigFile(file, env);
  return { file, data };
}

export class Config {

  public readonly projectDir: string;
  public readonly envs: string[] = [];
  public readonly configDir: string;
  public readonly defaultConfigFile: string;
  public readonly files: string[] = [];
  public defaultConfig: any;
  protected _ns: any;

  constructor(projectDir?: string, envs?: string) {
    this.projectDir = path.resolve(projectDir || '.');
    this.envs = (envs || process.env.NODE_ENV || '').split(',').map(s => s.trim()).filter(s => s);
    this.configDir = path.resolve(this.projectDir, 'config');
    this.defaultConfigFile = resolveConfigFile(path.resolve(this.projectDir, 'config'));
  }

  public get ns() {
    if (!this._ns) {
      throw new Error(`请先调用 Config.load() 载入配置文件`);
    }
    return this._ns;
  }

  /**
   * 加载所有配置文件
   */
  public load(): Config {
    if (this.envs.length < 1) {
      throw new Error(`请使用环境变量 NODE_ENV=xxx 指定配置名！`);
    }
    this.defaultConfig = readConfigFile(this.defaultConfigFile, '默认');
    this.files.push(this.defaultConfig);
    this._ns = createNamespace(this.defaultConfig);
    for (const name of this.envs) {
      const { file, data } = readEnvConfig(this.configDir, name);
      this.ns.merge(data);
      this.files.push(file);
    }
    return this;
  }

  /**
   * 获取指定配置项，如果不存在则抛出异常
   */
  public get(name: string): any {
    const data = this.ns.get(name);
    if (typeof data === 'undefined') {
      const msg = `无法获取配置项 ${ name }（未定义或其值为 undefined）`;
      throw new TypeError(msg);
    }
    return data;
  }

  /**
   * 检查指定配置项是否存在，如果不存在则抛出异常
   */
  public check(name: string): void {
    this.get(name);
  }

  /**
   * 如果指定配置项 存在则获取，否则返回默认值
   */
  public getOrDefault(name: string, value: any): any {
    if (this.has(name)) {
      return this.get(name);
    }
    return value;
  }

  /**
   * 判断指定配置项是否存在
   */
  public has(name: string): boolean {
    return this.ns.has(name);
  }

  /**
   * 设置配置项
   */
  public set(name: string, value: any): void {
    this.ns.set(name, value);
  }

  /**
   * 获取所有配置项
   */
  public all(): any {
    return this.ns.all();
  }

  /**
   * 通过指定环境的配置文件检测当前配置是否已经满足
   */
  public preCheckFromEnv(...envs: string[]): string[] {
    envs = envs.length > 0 ? envs : [ '_development' ];
    let list: string[] = [];
    for (const env of envs) {
      const { data } = readEnvConfig(this.configDir, env);
      list = list.concat(createNamespace.utils.getLeafs(data));
    }
    const missingList = [];
    for (const item of list) {
      if (!this.has(item)) {
        missingList.push(item);
      }
    }
    if (missingList.length > 0) {
      throw new Error(`根据环境 ${ envs.join(', ') } 检查，当前缺少以下配置项（未定义或其值为 undefined）:\n\n${ missingList.map(s => `  ${ s }`).join('\n') }`.trim());
    }
    return list;
  }

}
