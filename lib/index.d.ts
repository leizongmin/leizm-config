/**
 * 获取指定配置项，如果不存在则抛出异常
 */
export function get(name: string): any;

/**
 * 判断指定配置项是否存在
 */
export function has(name: string): boolean;

/**
 * 如果指定配置项 存在则获取，否则返回默认值
 */
export function getOrDefault(name: string, value: any): any;

/**
 * 检查指定配置项是否存在，如果不存在则抛出异常
 */
export function check(name: string): void;

/**
 * 设置配置项
 */
export function set(name: string, value: any): void;

/**
 * 获取所有配置项
 */
export function all(): { [key: string]: any};

/**
 * 通过指定环境的配置文件检测当前配置是否已经满足
 */
export function preCheckFromEnv(...envs: string[]): { file: string; data: Record<string, any>; list: string[] };
