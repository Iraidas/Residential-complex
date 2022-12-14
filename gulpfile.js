const { src, dest, parallel, series, watch } = require('gulp');

const browserSync   = require('browser-sync').create();
const concat        = require('gulp-concat');
const sass          = require('gulp-sass')(require('sass'));
const autoprefixer  = require('gulp-autoprefixer');
const cleancss      = require('gulp-clean-css');
const imagecomp     = require('compress-images');
const clean         = require('gulp-clean');
const versionNumber = require('gulp-version-number');

function browser_sync() {
    browserSync.init({
        server: { baseDir: 'src/' },
        notify: false,
        online: true
    })
}

function styles () {
    return src('src/sass/style.sass')
    .pipe(sass())
    .pipe(concat('style.min.css'))
    .pipe(autoprefixer( { 
        overrideBrowserslist: ['last 10 versions'], 
        grid: true
    } ))
    .pipe(cleancss(( { 
        level: { 
            1: { specialComments: 0 } 
        }, 
        format: 'beautify'
    } )))
    .pipe(dest('src/css'))
    .pipe(browserSync.stream())
}

async function images() {
	imagecomp(
		"src/img/src/**/*",
		"src/img/dest/",
		{ compress_force: false, statistic: true, autoupdate: true }, false,
		{ jpg: { engine: "mozjpeg", command: ["-quality", "75"] } },
		{ png: { engine: "pngquant", command: ["--quality=75-100", "-o"] } },
		{ svg: { engine: "svgo", command: "--multipass" } },
		{ gif: { engine: "gifsicle", command: ["--colors", "64", "--use-col=web"] } },
		function (err, completed) {
			if (completed === true) {
				browserSync.reload()
			}
		}
	)
}

function cleanimg() {
	return src('src/img/dest/', {allowEmpty: true}).pipe(clean())
}

function cleanDist () {
    return src('dist', {allowEmpty: true}).pipe(clean())
}

function buildCopy () {
    return src([
        'src/css/**/*.min.css',
        'src/img/dest/**',
        'src/**/*.html',
    ], { base: 'src' })
    .pipe(versionNumber({
        'value' : '%MDS%',
        'append' : {
            'key' : '_v',
            'cover' : 0,
            'to' : [
                'css',
            ],
        },
        'output' : {
            'file' : 'src/version.json'
        }
    }))
    .pipe(dest('dist'))
}

function startWatch () {
    watch('src/sass/*', styles)
    watch('src/**/*.html').on('change', browserSync.reload);
    watch('src/img/src/**/*', images);
}

exports.browser_sync   = browser_sync;
exports.styles         = styles;
exports.images         = images;
exports.cleanimg       = cleanimg;
exports.build          = series(cleanDist, styles, images, buildCopy);
exports.default        = parallel(styles, browser_sync, startWatch);