interface Config {

  /**
   * 获取指定配置项，如果不存在则抛出异常
   */
  get: (name: string) => any;

  /**
   * 判断指定配置项是否存在
   */
  has: (name: string) => boolean;

  /**
   * 检查指定配置项是否存在，如果不存在则抛出异常
   */
  check: (name: string) => void;

  /**
   * 设置配置项
   */
  set: (name: string, value: any) => void;

  /**
   * 获取所有配置项
   */
  all: () => { [key: string]: any};

  /**
   * 通过指定环境的配置文件检测当前配置是否已经满足
   */
  preCheckFromEnv: (...envs: string[]) => { file: string; data: Record<string, any>; list: string[] };

}

declare var config: Config;
export = config;
