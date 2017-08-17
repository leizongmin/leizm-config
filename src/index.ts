/**
 * 配置加载器
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import * as colors from 'colors';
import { Config } from './loader';

/**
 * 打印警告信息
 *
 * @param msg 警告信息
 */
function warn(msg: string): void {
  console.log(colors.white('--------------------------------------------------'));
  console.error(colors.red(msg));
  console.log(colors.white('--------------------------------------------------'));
}

/**
 * 打印消息被退出
 *
 * @param msg 出错信息
 * @param code 退出出错代码
 */
function die(msg: string, code: number): void {
  warn(msg);
  process.exit(code);
}

let config;
try {
  config = new Config('.').load();
} catch (err) {
  die(err.stack, 1);
}
export default config;
