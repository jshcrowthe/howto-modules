const babelify = require('babelify');
const browserify = require('browserify');
const gulp = require('gulp');
const source = require('vinyl-source-stream');

function compileApp() {
  return browserify("./src/index.js")
    .transform("babelify", {
      presets: ["env"],
      plugins: ['dynamic-import-node']
    })
    .bundle()
    .pipe(source('index.js'))
    .pipe(gulp.dest('dist'));
}

gulp.task('build', compileApp);