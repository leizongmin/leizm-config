'use strict';

const config = require('../');


console.log(config);

config.preCheckFromEnv('a', 'b');

console.log(config.get('global'));
console.log(config.get('global.a'));
console.log(config.all());
console.log(config.has('global.a'));
console.log(config.has('global.x'));
// console.log(config.get('global.x'));

// config.check('hello.world');
config.preCheckFromEnv('a', 'b');
