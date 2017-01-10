var gulp = require('gulp');
var connect = require('gulp-connect'); // webserver
var postcss = require('gulp-postcss'); // postcss
var sass = require('gulp-sass'); // scss 编译
var sourcemaps = require('gulp-sourcemaps'); // 生成 source map
var clean = require('gulp-clean'); // 删除文件
var autoprefixer = require('autoprefixer'); // 自动补hack
var cssnano = require('cssnano'); // css 压缩
var open = require('open'); // 用默认浏览器打开页面

// 编译 scss
gulp.task('scss', ['clean-css'], function () {
    var processors = [
        autoprefixer({
            browsers: ['iOS >= 7', 'Android >= 4.1']
        }),
        cssnano({
            zindex: false,
            autoprefixer: false,
            reduceIdents: false
        })
    ];
    return gulp.src('./scss/*.scss', {
            base: './scss/'
        })
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss(processors))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./css/'))
        .pipe(connect.reload());
});

// 文件变化刷新页面
gulp.task('change', function () {
    gulp.src(['./*.html', './js/*.js'])
        .pipe(connect.reload());
});

// 清空css
gulp.task('clean-css', function () {
    return gulp.src('./css/*')
        .pipe(clean());
});

// webserver
gulp.task('connect', function () {
    connect.server({
        host: '127.0.0.1',
        port: 8888,
        root: './',
        livereload: true,
        fallback: "index.html"
    });
});

// 浏览器打开
gulp.task('open', function () {
    open('http://127.0.0.1:8888');
});

// 默认任务
gulp.task('default', ['scss', 'connect'], function () {
    // 运行默认需要执行的任务
    gulp.run('open');
    // 监听文件的变化
    gulp.watch(['./scss/*.scss'], ['scss']);
    gulp.watch(['./js/*.js', './*.html'], ['change']);
});