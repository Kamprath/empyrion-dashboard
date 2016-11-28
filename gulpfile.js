'use strict';

var browserify = require('browserify'),
    gulp = require('gulp'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    gutil = require('gulp-util');

/**
 * Browserify, uglify, and produce source maps
 */
gulp.task('build', function() {
    // set up browserify instance on a task basis
    var b = browserify({
        entries: './resources/js/app.js',
        debug: true
    });

    return b.bundle()
        // prepare new file
        .pipe(
            source('app.min.js')
        ).pipe(buffer())

        // create sourcemaps
        .pipe(sourcemaps.init({
            loadMaps: true
        }))

        // uglify
        .pipe(uglify())
        .on('error', gutil.log)

        // write sourcemaps
        .pipe(
            sourcemaps.write('./')
        )

        // write output to file
        .pipe(
            gulp.dest('./resources/js/')
        );
});

gulp.task('default', ['build']);