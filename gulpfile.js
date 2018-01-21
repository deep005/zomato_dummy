const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const imagemin  = require('gulp-imagemin');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');

// compile sass and inject into browser

gulp.task('sass', function(){
    return gulp.src(['node_modules/bootstrap/scss/bootstrap.scss','src/scss/*.scss'])
        .pipe(sass({outputStyle: 'compressed'}))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest("src/css"))
        .pipe(browserSync.stream());
});

// move JS files to src/js


gulp.task('js', function(){
    return gulp.src(['src/js/main.js'])
        .pipe(gulp.dest("src/js"))
        .pipe(browserSync.stream());
});

// watch sass & serve

gulp.task('serve', ['sass'], function(){
    browserSync.init({
        server: "./src"
    });

    gulp.watch(['node_modules/bootstrap/scss/bootstrap.scss','src/scss/*.scss'],
    ['sass']);
    gulp.watch("src/*.html").on('change',browserSync.reload);
});



// compress images
gulp.task('compress-images', function(){
    return gulp.src('pre-images/*')
        .pipe(imagemin({ progressive: true}))
        .pipe(gulp.dest("src/images"));
});

gulp.task('default',['compress-images','js','serve']);