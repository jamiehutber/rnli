var changed    = require('gulp-changed');
var gulp       = require('gulp');
var imagemin   = require('gulp-imagemin');

gulp.task('images', function() {
  var dest = 'app/www/img';

  return gulp.src('frontend/img/**')
    .pipe(changed(dest)) // Ignore unchanged files
    .pipe(imagemin()) // Optimize
    .pipe(gulp.dest(dest));
});
