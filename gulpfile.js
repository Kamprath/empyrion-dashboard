var browserify = require('browserify'),
    gulp = require('gulp'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    gutil = require('gulp-util'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish');

/**
 * Lint unminified JS files using jshint
 */
gulp.task('lint', function() {
    return gulp.src([
        '!./resources/js/*.min.js',
        './resources/js/*.js', 
        './resources/js/**/*.js'
    ])
        .pipe(jshint({
            strict: false
        }))
        .pipe(jshint.reporter(stylish))
        .pipe(jshint.reporter('fail'))
});

/**
 * Browserify, uglify, and produce source maps
 */
gulp.task('build', ['lint'], function() {
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