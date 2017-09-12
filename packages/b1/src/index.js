import('@howto-modules/c1')
  .then(module => {
    module.logModule();
  });

export function logModule() {
  console.log('`logModule` called in @howto-modules/b1');
}

export function totallyUnused() {
  console.log('I go totally unused!');
}