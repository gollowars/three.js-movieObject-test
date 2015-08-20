var gulp = require("gulp");
var gutil = require('gulp-util');
var sass = require('gulp-sass');
var browserSync =require('browser-sync');
//default

gulp.task('default', ['browser-sync']);

//sass
// gulp.task("sass", function() {
//     gulp.src("./public_html/assets/scss/*.scss")
//         .pipe(sass())
//         .pipe(gulp.dest("./public_html/assets/css"));
//         browserSync.reload();
// });


gulp.task('browser-sync', function() {
    browserSync({
        server: {
             baseDir: "./public_html/"       //対象ディレクトリ
            ,index  : "index.html"      //インデックスファイル
        }
    });
});

//
//ブラウザリロード
//
gulp.task('bs-reload', function () {
    browserSync.reload();
});

//
//監視ファイル
//
gulp.task('default', ['browser-sync'], function () {
    gulp.watch("./public_html/*.html",            ['bs-reload']);
    gulp.watch("./public_html/assets/css/*.css", ['bs-reload']);
    gulp.watch("./public_html/asset/js/*.js",   ['bs-reload']);
    // gulp.watch("./public_html/assets/scss/*.scss", ['sass']);
});