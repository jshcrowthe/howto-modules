import { logModule as logModuleB1 } from '@howto-modules/b1';
import { logModule as logModuleB2 } from '@howto-modules/b2';

logModuleB1();
logModuleB2();

export function logModule() {
  console.log('`logModule` called in @howto-modules/a');
}

export function totallyUnused() {
  console.log('I go totally unused!');
}