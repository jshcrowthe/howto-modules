import('@howto-modules/c2')
  .then(module => {
    module.logModule();
  });

export function logModule() {
  console.log('`logModule` called in @howto-modules/b2');
}

export function totallyUnused() {
  console.log('I go totally unused!');
}