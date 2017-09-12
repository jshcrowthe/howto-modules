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
    .pipe(header("console.log('Loaded @howto-modules/c via pkg.main');\r\n"))
    .pipe(gulp.dest('dist'));
}

function buildBrowser() {
  return gulp.src('src/index.js')
    .pipe(babel(babelConfig))
    .pipe(header("console.log('Loaded @howto-modules/c via pkg.browser');\r\n"))
    .pipe(rename({
      suffix: '.browser'
    }))
    .pipe(gulp.dest('dist'));
}

gulp.task('build', gulp.parallel([
  buildNode,
  buildBrowser
]));