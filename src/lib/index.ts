/**
 * 配置加载器
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import { Config } from "./core";
export * from "./core";

const config = new Config();
config.load();

export { config };
export default config;
