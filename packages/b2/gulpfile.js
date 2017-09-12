const babel = require('gulp-babel');
const gulp = require('gulp');
const header = require('gulp-header');
const rename = require('gulp-rename');

const babelConfig = {
  presets: [
    'env'
  ],
  plugins: [
    'dynamic-import-node'
  ]
};

function buildNode() {
  return gulp.src('src/index.js')
    .pipe(babel(babelConfig))
    .pipe(header("console.log('Loaded @howto-modules/b2 via pkg.main');\r\n"))
    .pipe(gulp.dest('dist'));
}

function buildModule() {
  const customConfig = Object.assign({}, babelConfig, {
    plugins: [
      'syntax-dynamic-import'
    ]
  });
  return gulp.src('src/index.js')
    .pipe(babel(customConfig))
    .pipe(header("console.log('Loaded @howto-modules/b2 via pkg.module');\r\n"))    
    .pipe(rename({
      suffix: '.esm'
    }))
    .pipe(gulp.dest('dist'));
}

gulp.task('build', gulp.parallel([
  buildNode,
  buildModule
]));