/**
 * 配置加载器
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import 'source-map-support/register';
import * as colors from 'colors';

const argv = process.argv.slice(2);
const cmd = argv[0];

function main(): void {
  try {
    switch (String(cmd).toLowerCase()) {
      case 'load':
        cmdLoad();
        break;
      case 'check':
        cmdCheck();
        break;
      case 'help':
        cmdHelp();
        break;
      default:
        cmdUnkonwn();
    }
  } catch (err) {
    console.error(colors.red(err.message));
  }
}
main();

function cmdLoad(): void {
  const config = require('../').default;
  console.log(jsonStringify(config.all(), 2));
}

function cmdCheck(): void {
  const config = require('../').default;
  config.preCheckFromEnv.apply(config, argv.slice(1));
  console.log('OK.');
}

function cmdHelp(): void {
  console.log('--------------------------------------------------');
  console.log('使用方法:');
  console.log('  config-loader help          显示帮助信息');
  console.log('  config-loader load          打印载入的配置信息');
  console.log('  config-loader check <env>   根据给定的环境文件，检查当前是否有缺失的配置项');
  console.log('--------------------------------------------------');
}

function cmdUnkonwn(): void {
  if (cmd) {
    console.log(colors.red('未知命令"%s"'), cmd);
  }
  cmdHelp();
}

function jsonStringify(data: any, space: number): string {
  const seen: any[] = [];
  return JSON.stringify(data, function (key, val) {
    if (!val || typeof val !== 'object') {
      return val;
    }
    if (seen.indexOf(val) !== -1) {
      return '[Circular]';
    }
    seen.push(val);
    return val;
  }, space);
}
