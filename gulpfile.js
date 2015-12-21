var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var kmc = require('gulp-kmc');
var less = require('gulp-less');
var minifyCSS = require('gulp-minify-css');
var connect = require('gulp-connect');
var XTemplate = require('xtemplate');
var gulpXTemplate = require('gulp-xtemplate');

var src = './src',
    dest = './build';

kmc.config({
    packages: [{
        name: 'jiyoujia-decoration-service',
        base: src
    }]
});

gulp.task('webserver', function() {
    connect.server({
        port: 5555,
        livereload: true
    });
});

gulp.task('kmc', function() {

    //返回数据流告诉gulp，kmc任务已完成，可以去执行依赖任务了
    return gulp.src(src + '/**/*.js')
        //转换cmd模块为kissy模块
        .pipe(kmc.convert({
            kissy: true,
            // modulex: true ,
            // define: true
            exclude: [], //忽略该目录
            ignoreFiles: ['.combo.js', '-min.js'], //忽略该类文件,
            requireCss: true //是否保留js源码中的require('./xxx.css) 默认true
        }))
        //合并文件
        .pipe(kmc.combo({
            deps: false,
            files: [
                {
                    src: 'index.js',
                    dest: 'index.js'
                }
        ]
        }))
        .pipe(gulp.dest(dest))
        .pipe(connect.reload());
});

gulp.task('uglify', ['kmc', 'xtpl'], function() {
    gulp.src([dest + '/**/*.js', '!' + dest + '/**/**-min.js'])
        .pipe(uglify())
        .pipe(rename({
            extname: '-min.js'
        }))
        .pipe(gulp.dest(dest));
});

gulp.task('less', function() {
    gulp.src([src + '/**/**.less', '!' + src + '/**/_**.less'])
        .pipe(less())
        .pipe(gulp.dest(dest))
        .pipe(minifyCSS())
        .pipe(rename({
            extname: '-min.css'
        }))
        .pipe(gulp.dest(dest))
        .pipe(connect.reload());
});

gulp.task('xtpl', function() {
    return gulp.src(src + '/**/*.xtpl')
        .pipe(gulpXTemplate({
            wrap: 'kissy',
            XTemplate: XTemplate
        }))
        .on('error', function(e) {
            console.log(e);
        })
        //转换cmd模块为kissy模块
        .pipe(kmc.convert({
            kissy: true,
            // modulex: true ,
            // define: true
            exclude: [], //忽略该目录
            ignoreFiles: ['.combo.js', '-min.js'], //忽略该类文件,
            requireCss: true //是否保留js源码中的require('./xxx.css) 默认true
        }))
        .pipe(gulp.dest(dest))
        .pipe(connect.reload());
});

gulp.task('watch', function() {
    gulp.watch(src + '/**/**.js', ['kmc']);
    gulp.watch(src + '/**/**.less', ['less']);
    gulp.watch(src + '/**/**.xtpl', ['xtpl']);
});

gulp.task('build', ['xtpl', 'kmc', 'uglify', 'less']);
gulp.task('start', ['webserver', 'watch']);

