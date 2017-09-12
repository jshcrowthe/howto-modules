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
    .pipe(header("console.log('Loaded @howto-modules/c2 via pkg.main');\r\n"))
    .pipe(gulp.dest('dist'));
}

gulp.task('build', gulp.parallel([
  buildNode,
]));