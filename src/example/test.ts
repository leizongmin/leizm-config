'use strict';

import { Config } from '../lib';

const config = new Config();
console.log(config);

config.load();
config.preCheckFromEnv('a', 'b');

console.log(config.get('global'));
console.log(config.get('global.a'));
console.log(config.all());
console.log(config.has('global.a'));
console.log(config.has('global.x'));
// console.log(config.get('global.x'));

// config.check('hello.world');
config.preCheckFromEnv('a', 'b');
