//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
/*
    Plugins
*/
//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
var gulp = require('gulp'),
    watch = require('gulp-watch'),
    concat = require('gulp-concat'),
    compass = require('gulp-compass'),
    // style injection/browser reload
    browserSync = require('browser-sync'),
    reload = browserSync.reload,
    uglifycss = require('gulp-uglifycss'),
    // throw errors w/o stopping watch tasks
    plumber = require('gulp-plumber'),
    gutil = require('gulp-util'),
    beep = require('beepbeep'), // notify user of error with beeps
    // JS plugins
    uglify = require('gulp-uglify'),
    beautify = require('gulp-beautify')
//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
/*
    Project Variables
*/
//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
// Components Resources
var components = './components/'
var sassSources = [
    components + '/sass/*.scss',
    components + '/sass/**/*.scss',
];
var jsSources = [
    components + '/js/*.js',
    components + '/js/**/*.js',
];
// App Resources
var appDir = './app/';
var appFiles = ['./app/*.*'];
var cssDir = './app/css/';
var cssMainStylesheet = './app/css/';
var jsDir = './app/js/';
///■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
/*
    Error Handling
*/
//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
// SASS
var onErrorStyles = function(err) {
    beep([300, 300, 300]);
    gutil.log(gutil.colors.magenta(err))
    this.emit('end');
};
// JavaScript
var onErrorJS = function(err) {
    beep([100, 100]);
    gutil.log(gutil.colors.green(err))
    this.emit('end');
};
///■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
/*
    File Synchronization, Style Injection.
*/
//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./app"
        }
        // proxy: yoursite.local, // alternative to "server:{baseDir}" above
        /*
            Will make app available outside of network on `staging-url.localtunnel.me`
        */
        // tunnel: true,
        // tunnel: "staging-url"
    });
    gulp.watch(sassSources, ['sass-to-css']); // change to `css-uglify` to run `sass-to-css` then uglify CSS
    gulp.watch(appFiles).on('change', browserSync.reload);
    // gulp.watch(jsSources, ['js-uglify']); // or `js-beautify`.
});
//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
/*
    Compile SASS
*/
//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
gulp.task('sass-to-css', function() {
    return gulp.src(sassSources)
        .pipe(plumber({
            errorHandler: onErrorStyles
        }))
        .pipe(compass({
            sass: components + '/sass',
            image: components + '/images',            
            css: cssDir,
            config_file: 'compass.rb'
        }))
        .pipe(concat('styles.css'))
        .pipe(gulp.dest(cssDir))
        .pipe(browserSync.stream());
});
// Task not run by default. `sass-to-css` is the dependency task that runs prior to `css-uglify`.
gulp.task('css-uglify', ['sass-to-css'], function() {
    return gulp.src(cssMainStylesheet)
        .pipe(plumber({
            errorHandler: onErrorStyles
        }))
        .pipe(uglifycss)
        // .pipe(concat('styles.min.css')) // don't forget to update App Files with .min.css if using this
        .pipe(gulp.dest(cssDir))
});
//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
/*
    Beautify or Uglify JS (uncomment JS watch method in `browser-sync` task to use these).
*/
//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
gulp.task('js-beautify', function() {
    return gulp.src(jsSources)
        .pipe(beautify())
        .pipe(plumber({
            errorHandler: onErrorJS
        }))
        .pipe(gulp.dest(jsDir));
});
gulp.task('js-uglify', function() {
    return gulp.src(jsSources)
        .pipe(uglify())
        .pipe(plumber({
            errorHandler: onErrorJS
        }))
        .pipe(gulp.dest(jsDir));
});
//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
/*
    Default Task
*/
//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■

gulp.task('default', ['sass-to-css', 'browser-sync']);