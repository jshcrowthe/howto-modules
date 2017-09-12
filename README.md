# HOWTO: Modules (A lib authors perspective)

This is a repo to demonstrate how different bundlers interact with a libraries module setup. Webpack, Rollup, and Browserify all handle dependencies slightly different so this repo should help outline some of the key differences between the setups.

## The Setup

This repo is structured as a monorepo exposing 5 base modules, each module provides certain builds of the source and exposes them through one of three mechanisms:

- `pkg.main`
- `pkg.browser`
- `pkg.module`

Each of these packages is slightly different and tailored to a specific use case:

- `pkg.main` - This would be the entrypoint into your library for any Node.js applications, also serves as the "default" module if another of higher precedence does not exist
- `pkg.module` - This version of the application exposes raw ES Modules. The rest of the code is transpiled but the module syntax is left intact.
- `pkg.browser` - This version of the application is nerely identical to the `pkg.main` but designed for browser consumption. ES Modules are transpiled into the following syntax (using [babel-plugin-dynamic-import-node](https://npm.im/babel-plugin-dynamic-import-node)):

```javascript
Promise.resolve().then(function () {
  return require('module');
}).then(function (module) {
  // code using module...
});
```

In addition each component is instrumented to log when it is loaded as well as what functions inside of it fire.

### Component Build Breakdown

| Module Name | Uses dynamic `import()` | `pkg.module` | `pkg.browser` | `pkg.main` |
| ----------- | --------------- | ------------ | ------------- | ---------- |
| @howto-modules/a | ❌ | ✅ | ✅ | ✅ |
| @howto-modules/b1 | ✅ | ❌ | ✅ | ✅ |
| @howto-modules/b2 | ✅ | ✅ | ❌ | ✅ |
| @howto-modules/c1 | ❌ | ❌ | ❌ | ✅ |
| @howto-modules/c2 | ❌ | ❌ | ❌ | ✅ |

### Component Dependency Tree

The dependencies are hopefully simple and are arranged as follows:

- `@howto-modules/a` --> `@howto-modules/b1` -(dynamic import)-> `@howto-modules/c1`
- `@howto-modules/a` --> `@howto-modules/b2` -(dynamic import)-> `@howto-modules/c2`

The main difference in the dependencies is in `@howto-modules/b1` and `@howto-modules/b2`. Each module provides a different export binary (`pkg.browser` and `pkg.module` respectively) and depends on an isolate instance of a duplicated dependency (i.e. `@howto-modules/c1` and `@howto-modules/c2`, the rationale for this will be explained later). With this we are able to see examples of how each bundler handles the dependency.

## Bundler Behavior

### Webpack

Webpack handles all three of our module imports and prioritizes them as follows:

`pkg.browser` > `pkg.module` > `pkg.main`

Thus, we are able to see code chunking happening for those modules using only the `pkg.module` syntax. As `pkg.browser` has higher priority, any benefit that would have been possible via ES Modules is lost if both are provided.

```
Hash: b5180313f5931227d490
Version: webpack 3.5.6
Time: 81ms
     Asset       Size  Chunks             Chunk Names
0.chunk.js  436 bytes       0  [emitted]  
  index.js     8.3 kB       1  [emitted]  main
   [0] ./src/index.js 59 bytes {1} [built]
   [1] ../a/dist/index.browser.js 483 bytes {1} [built]
   [2] ../b1/dist/index.browser.js 490 bytes {1} [built]
   [3] ../c1/dist/index.js 355 bytes {1} [built]
   [4] ../b2/dist/index.esm.js 438 bytes {1} [built]
   [5] ../c2/dist/index.js 356 bytes {0} [built]
```

Unfortunately, if `@howto-modules/b1` and `@howto-modules/b2` both dynamically imported the same dependency (formerly known as `@howto-modules/c` before it was split), Webpack was unable to code-split the async dependency and it resulted in an overall larger bundle.

#### Console Output

| Source | Log |
| ------ | --- |
| index.js:9646 | Loaded @howto-modules/a via pkg.browser | 
| index.js:9674 | Loaded @howto-modules/b1 via pkg.browser |
| index.js:9720 | Loaded @howto-modules/b2 via pkg.module |
| index.js:9689 | `logModule` called in @howto-modules/b1 |
| index.js:9733 | `logModule` called in @howto-modules/b2 |
| index.js:9663 | `logModule` called in @howto-modules/a |
| index.js:9700 | Loaded @howto-modules/c via pkg.main |
| index.js:9709 | `logModule` called in @howto-modules/c1 |
| 0.chunk.js:6 | Loaded @howto-modules/c2 via pkg.main |
| 0.chunk.js:15 | `logModule` called in @howto-modules/c2 |

### Rollup

<!-- TODO: Update this once Rollup supports at least dynamic imports -->
Rollup does not support dynamic imports, or code splitting. As this test relies heavily on dynamic imports, Rollup was omitted.

### Browserify

Browserify does not support the `pkg.module` field and defaults to the `pkg.browser` import (if it exists). For the implementation tested, it creates a single output file as expected.

#### Console Output

| Source | Log |
| ------ | --- |
| index.js:2 | Loaded @howto-modules/a via pkg.browser |
| index.js:26 | Loaded @howto-modules/b1 via pkg.browser |
| index.js:48 | Loaded @howto-modules/b2 via pkg.main |
| index.js:41 | `logModule` called in @howto-modules/b1 |
| index.js:63 | `logModule` called in @howto-modules/b2 |
| index.js:19 | `logModule` called in @howto-modules/a |
| index.js:77 | Loaded @howto-modules/c via pkg.main |
| index.js:93 | Loaded @howto-modules/c2 via pkg.main |
| index.js:86 | `logModule` called in @howto-modules/c1 |
| index.js:102 | `logModule` called in @howto-modules/c2 |

## Next Questions

It seems peculiar that the default behavior of webpack is to prioritize the `pkg.browser` over the `pkg.module` when it is more capable of intelligently handling the `pkg.module`. That is probably worth a discussion.

The current status of [the node ES Module Interop proposal](https://github.com/nodejs/node-eps/blob/6eef91d4ab4544ee5ed01df86dd7d055e90e130e/002-es-modules.md), will enforce usage of the `.mjs` file extension for loading Node.js specific imports. If this is the proposal that ends up shipping, it seems like there is a clean deliniation between browser and node ES Module entrypoints in the package.json (i.e. `pkg.main` for Node and `pkg.module` for browser). It is unclear to me how this will play alongside backwards compatability with CJS modules. If the `pkg.module` becomes a standardized entrypoint for Node.js, we will, presumably, need to come up w/ a solution for ES modules for the browser.

## tl;dr

When shipping a lib, you should keep the following in mind:

- There is a lot of unknowns about what the future will bring in this space. 
- `pkg.module` allows users of the dynamic import syntax to get free perf wins with Webpack.
- `pkg.browser` is prioritized over `pkg.module` so if you ship both (e.g. to support browserify as well), Webpack users won't get the benefits.
- Rollup will not support dynamic imports until [Acorn](https://npm.im/acorn) supports them. This should happen once the proposal reaches Stage 4 (i.e. two browsers have implemented the spec, it is currently stage 3).
- If you choose to ship a `pkg.main`, `pkg.module`, and `pkg.browser` Webpack users can configure their builds to prioritize the `pkg.module` by passing the following to their `webpack.config.js`:

```javascript
{
  ...
  resolve: {
    mainFields: ['module', 'browser', 'main']
  }
}
```

