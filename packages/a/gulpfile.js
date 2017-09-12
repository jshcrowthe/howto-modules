const babel = require('gulp-babel');
const gulp = require('gulp');
const header = require('gulp-header');
const rename = require('gulp-rename');

const babelConfig = {
  presets: [
    'env'
  ]
};

function buildNode() {
  return gulp.src('src/index.js')
    .pipe(babel(babelConfig))
    .pipe(header("console.log('Loaded @howto-modules/a via pkg.main');\r\n"))
    .pipe(gulp.dest('dist'));
}

function buildBrowser() {
  return gulp.src('src/index.js')
    .pipe(babel(babelConfig))
    .pipe(header("console.log('Loaded @howto-modules/a via pkg.browser');\r\n"))
    .pipe(rename({
      suffix: '.browser'
    }))
    .pipe(gulp.dest('dist'));
}

function buildModule() {
  const customConfig = Object.assign({}, babelConfig, {
    presets: [
      [ "env", { "modules": false }]
    ]
  });
  return gulp.src('src/index.js')
    .pipe(babel(customConfig))
    .pipe(header("console.log('Loaded @howto-modules/a via pkg.module');\r\n"))    
    .pipe(rename({
      suffix: '.esm'
    }))
    .pipe(gulp.dest('dist'));
}

gulp.task('build', gulp.parallel([
  buildNode,
  buildBrowser,
  buildModule
]));