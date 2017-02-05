var browserify = require('browserify'),
    gulp = require('gulp'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    gutil = require('gulp-util'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    less = require('gulp-less');
    cleanCss = require('gulp-clean-css');

/**
 * Lint unminified JS files using jshint
 */
gulp.task('lint', function() {
    return gulp.src([
        './src/js/*.js', 
        './src/js/**/*.js'
    ])
        .pipe(jshint({
            strict: false
        }))
        .pipe(jshint.reporter(stylish))
        .pipe(jshint.reporter('fail'))
});

/**
 * Compile Less, produce source maps, and minify CSS
 */
gulp.task('build-css', function() {
    return gulp.src('./src/less/**/*.less')
        .pipe(
            less()
        )
        .pipe(
            sourcemaps.init()
        )
        .pipe(
            cleanCss()
        )
        .pipe(
            sourcemaps.write('./')
        )
        .pipe(
            gulp.dest('./public/resources/css/')
        );
});

/**
 * Browserify, uglify, and produce source maps
 */
gulp.task('build-js', ['lint'], function() {
    // set up browserify instance on a task basis
    var b = browserify({
        entries: './src/js/app.js',
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
            gulp.dest('./public/resources/js/')
        );
});

// Define build and default tasks
gulp.task('build', [
    'build-js',
    'build-css'
]);
gulp.task('default', ['build']);