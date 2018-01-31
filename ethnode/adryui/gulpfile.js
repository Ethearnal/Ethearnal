'use strict';

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    prefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    rigger = require('gulp-rigger'),
    cssmin = require('gulp-minify-css'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    rimraf = require('rimraf'),
    browserSync = require("browser-sync"),
    concat = require('gulp-concat'),
    sequence = require('gulp-run-sequence'),
    cache = require('gulp-cache')

var path = {
    build: {
        html: 'dist/',
        css: 'dist/css/',
        img: 'dist/img/',
        fonts: 'dist/fonts/'
    },
    src: {
        html: 'src/*.html',
        scss: 'src/scss/main.scss',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*',
        libsStyles: [
            `node_modules/bootstrap/dist/css/bootstrap.min.css`,
            `node_modules/font-awesome/css/font-awesome.min.css`
        ],
        libsJS: [
            `node_modules/jquery/dist/jquery.min.js`,
            `node_modules/bootstrap/dist/js/bootstrap.min.js`,
        ]
    },
    clean: './dist'
};

var argv = require('yargs').argv;
var isProduction = (argv.prod === undefined) ? false : true;

/* BrowserSync server config -------------------------
 ----------------------------------------------------- */
var config = {
    server: {
        baseDir: "./dist"
    },
    //tunnel: true,
    host: 'localhost',
    port: 9090
};

/* Html compiler with rigger tool --------------------
 ----------------------------------------------------- */
gulp.task('html:build', function() {
    gulp.src(path.src.html)
        .pipe(rigger())
        .pipe(gulp.dest(path.build.html))
        .pipe(browserSync.reload({ stream: true }))
});

gulp.task('style:build', function() {
    if (isProduction) {
        gulp.src(path.src.scss)
            .pipe(sass().on('error', sass.logError))
            .pipe(prefixer())
            .pipe(gulp.dest(path.build.css))
    } else {
        gulp.src(path.src.scss)
            .pipe(sourcemaps.init())
            // can output style in :'nested', ':expanded', ':compact' or ':compressed'
            .pipe(sass().on('error', sass.logError))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest(path.build.css))
            // .pipe(browserSync.reload({stream: true}))
    }
});

gulp.task('styleLib:build', function() {
    gulp.src(path.src.libsStyles)
        .pipe(prefixer())
        .pipe(cssmin())
        .pipe(concat('vendor.min.css'))
        .pipe(gulp.dest(path.build.css))
});

gulp.task('js:build', function() {
    gulp.src(path.src.js)
        .pipe(rigger())
        .pipe(sourcemaps.init())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.js))
        .pipe(browserSync.reload({ stream: true }))
});

gulp.task('jsLib:build', function() {
    gulp.src(path.src.libsJS)
        .pipe(concat('vendor.min.js'))
        .pipe(gulp.dest(path.build.js))
});

gulp.task('image:build', function() {
    gulp.src(path.src.img)
        .pipe(cache(imagemin({
            progressive: true,
            svgoPlugins: [{
                removeViewBox: true
            }],
            use: [pngquant()],
            interlaced: true
        })))
        .pipe(gulp.dest(path.build.img))
});

gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('build', (cb) => {
    sequence('clean', [
        'html:build',
        'style:build',
        'styleLib:build',
        'fonts:build',
        'image:build'
    ], () => cb());
});

gulp.task('watch', () => {
    gulp.watch('src/**/*.html', ['html:build']);
    gulp.watch('src/scss/**/*.scss', ['style:build']);
    gulp.watch(path.src.img, ['image:build']);
    gulp.watch(path.src.fonts, ['fonts:build']);
});

gulp.task('webserver', function() {
    browserSync(config);
});

gulp.task('clean', function(cb) {
    rimraf(path.clean, cb);
});

gulp.task('clearcache', function() {
    return cache.clearAll();
});

gulp.task('default', ['build', 'watch']); // 'webserver'