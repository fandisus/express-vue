//https://www.npmjs.com/package/gulp-uglify-es
//perlu pump, jangan dipake: https://www.npmjs.com/package/gulp-uglify
//ndak perlu, sudah ado gulp-uglify-es: https://www.npmjs.com/package/gulp-babel
//gulp pake babel, sudah ado uglify-es ndak perlu lagi: https://markgoodyear.com/2015/06/using-es6-with-gulp/
const fse = require('fs-extra');

var {src, dest, series, parallel, watch, task}  = require('gulp'),
		gulpIf = require('gulp-if'),

		//For scripts and vue (gulp-vue-single-file-component)
		babel = require('gulp-babel'),
		rename = require('gulp-rename'),
		vueComponent = require('gulp-vue-single-file-component'),

		terser = require('gulp-terser'),
		uglify = require('gulp-uglify-es').default,
		jobfus = require('gulp-javascript-obfuscator'), //another option: https://javascript-obfuscator.org/  lebih repot
		htmlmin = require('gulp-htmlmin'),
		plumber = require('gulp-plumber'),
		sass = require('gulp-sass'),
		cached = require('gulp-cached'),
		tscompile = require('gulp-typescript'),
		tsProject = tscompile.createProject('tsconfig.json');
		// compileConfig = { module:'commonjs',target:'es6'},

var frontendLibsSrc = './src/public/libs/**/*',
		frontendLibsDist = './dist/public/libs',
		amdJsSrc = ['./src/public/js/**/*.js'],
		amdJsDist = ['./dist/public/js'],

		//Common dist
		saasSrc = './src/**/*.scss',
		vueSrc = './src/**/*.vue',
		tsSrc = 'src/**/*.ts',
		htmlSrc = ['./src/**/*.html','./src/**/*.htm', '!./src/public/jslib/**/*'],
		imageFiles = ['./src/**/*.jpg','./src/**/*.jpeg','./src/**/*.png','./src/**/*.ico','./src/**/*.gif','./src/**/*.giff','./src/**/*.svg','./src/**/*.bmp'],
		pugFiles = './src/**/*.pug',
		otherSrc = ['./src/**/*.txt','./src/**/*.json'],
		distFolder = './dist';

var obfuscate = false;

//frontendLibs
function frontendLibs() {
	return src(frontendLibsSrc).pipe(cached('publicJslib'))
		.pipe(dest(frontendLibsDist));
}
exports.frontendLibs = frontendLibs;

function amdJs() {
	return src(amdJsSrc).pipe(cached('amdJs'))
		.pipe(babel({ plugins: ['@babel/plugin-transform-modules-amd'] }))
		.pipe(gulpIf(obfuscate, terser()))
		.pipe(gulpIf(obfuscate, uglify()))
		.pipe(gulpIf(obfuscate, jobfus()))
		.pipe(dest(amdJsDist));
}
exports.amdJs = amdJs;

function vue() {
	return src(vueSrc).pipe(cached('vue'))
		.pipe(vueComponent({ debug: true, loadCssMethod: 'loadCss' }))
		.pipe(babel({ plugins: ['@babel/plugin-transform-modules-amd'] }))
		.pipe(rename({ extname: '.js' }))
		.pipe(gulpIf(obfuscate, terser()))
		.pipe(gulpIf(obfuscate, uglify()))
		.pipe(gulpIf(obfuscate, jobfus()))
		.pipe(dest(distFolder));
		// .pipe(browserSync.stream());
}
exports.vue = vue;

//Error: Did you forget to signal async completion?
task('saas', function() { 
	return src(saasSrc).pipe(cached('saas')).pipe(plumber())
		.pipe(sass().on('error', sass.logError))
		.pipe(dest(distFolder));
});
// exports.sass = sass;

//No need to uglify serverside code.
function ts() {
	return src(tsSrc).pipe(cached('ts')).pipe(plumber())
		// .pipe(tscompile(compileConfig))
		.pipe(tsProject())
		.pipe(dest(distFolder));
}
exports.ts = ts;

//Perhaps should be removed. Should not need html files in serverside.
function html() { //minify
	return src(htmlSrc).pipe(cached('html')).pipe(plumber())
	.pipe(htmlmin({collapseWhitespace:true}))
	.pipe(dest(distFolder));
}

//https://stackoverflow.com/questions/28876469/multiple-file-extensions-within-the-same-directory-using-gulp
function images() { return src(imageFiles).pipe(cached('images')).pipe(dest(distFolder)); }
function pug() { return src(pugFiles).pipe(cached('pug')).pipe(dest(distFolder)); }
function others() { return src(otherSrc).pipe(cached('others')).pipe(dest(distFolder)); }
exports.images = images;
exports.pug = pug;
exports.others = others;

function removeDist(cb) { fse.removeSync('./dist'); cb(); }
function setObfuscate(cb) { obfuscate = true; cb(); }
function noObfuscate(cb) { obfuscate = false; cb(); }
exports.dev = series(
	parallel(removeDist, noObfuscate),
	parallel(frontendLibs, amdJs, vue, ts, 'saas', html, images, pug, others)
);
exports.prod = series(
	parallel(removeDist, setObfuscate),
	parallel(frontendLibs, amdJs, vue, ts, 'saas', html, images, pug, others)
);

function watchDev() {
	obfuscate = false;
	watch(frontendLibsSrc, {delay:500 }, series(frontendLibs));
	watch(amdJsSrc, {delay:500 }, series(amdJs));
	watch(vueSrc, {delay:500 }, series(vue));
	watch(saasSrc, {delay:500 }, series('saas'));
	watch(tsSrc, {delay:500 }, series(ts));
	watch(htmlSrc, {delay:500 }, series(html));
	watch(imageFiles, {delay:500 }, series(images));
	watch(pugFiles, {delay:500 }, series(pug));
	watch(otherSrc, {delay:500 }, series(others));
}
function watchProd() {
	obfuscate = true;
	watch(frontendLibsSrc, {delay:500 }, series(frontendLibs));
	watch(amdJsSrc, {delay:500 }, series(amdJs));
	watch(vueSrc, {delay:500 }, series(vue));
	watch(saasSrc, {delay:500 }, series('saas'));
	watch(tsSrc, {delay:500 }, series(ts));
	watch(htmlSrc, {delay:500 }, series(html));
	watch(imageFiles, {delay:500 }, series(images));
	watch(pugFiles, {delay:500 }, series(pug));
	watch(otherSrc, {delay:500 }, series(others));
}
exports.watch = watchDev;
exports.watchProd = watchProd;