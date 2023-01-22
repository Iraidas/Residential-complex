const { src, dest, watch, parallel, series } = require('gulp');

const browserSync  = require('browser-sync').create(); 
const sass         = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer')
const concat       = require('gulp-concat');
const uglify       = require('gulp-uglify-es').default;
const imagemin     = require('gulp-imagemin');
const clean        = require('gulp-clean');

function browsersync() {
    browserSync.init({
        server: { baseDir: 'app/'},
        notify: false,
        online: true
    })
}

function cleanDist() {
    return src('dist', {allowEmpty: true})
        .pipe(clean())
}

function styles() {
    return src('app/sass/style.sass')
        .pipe(sass({ outputStyle: 'compressed'}))
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({ 
            overrideBrowserslist: ['last 10 versions'], 
            grid: true 
        }))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream())
}

function scripts() {
    return src([
        'node_modules/jquery/dist/jquery.js',
        'app/js/main.js'
        ])
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest('app/js'))
        .pipe(browserSync.stream())
}

function images() {
    return src('app/images/**/*')
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 75, progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]))
        .pipe(dest('dist/images'))
}

function watching () {
    watch(['app/sass/**/*.sass'], styles);
    watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
    watch('app/*.html').on('change', browserSync.reload);
}

function build() {
    return src([
        'app/css/style.min.css',
        'app/fonts/**/*',
        'app/js/main.min.js',
        'app/**/*.html'
    ], { base: 'app' })
        .pipe(dest('dist'))
}

exports.browsersync = browsersync;
exports.styles      = styles;
exports.images      = images;
exports.watching    = watching;
exports.scripts     = scripts;
exports.cleanDist   = cleanDist;

exports.build       = series(cleanDist, images, styles, scripts, build);
exports.default     = parallel(styles, scripts, browsersync, watching);