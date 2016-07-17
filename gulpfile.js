'use strict';

const gulp = require('gulp');
const release = require('gulp-release');
const eslint = require('gulp-eslint');

const PATHS = {
  src: ['index.js', 'lib/**/*.js']
};

// Add `release` task
release.register(gulp);

gulp.task('eslint', () =>
  gulp.src(PATHS.src)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
);

gulp.task('validate', ['eslint']);

gulp.task('watch', () => gulp.watch(PATHS.src, ['eslint']));

gulp.task('default', ['watch']);
