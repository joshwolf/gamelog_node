var gulp = require('gulp'),
	plugins = require("gulp-load-plugins")({
		pattern: ['gulp-*', 'gulp.*', 'main-bower-files'],
		replaceString: /\bgulp[\-.]/
	});

// Define default destination folder
var dest = 'app/';
 
gulp.task('default', function() {
	gulp.watch(['app/styles/*.scss','!app/styles/_*.scss'], ['sass']);
	gulp.watch(['app/styles/*.css','!app/styles/*.min.css'], ['minifycss']);
	gulp.watch(['app/scripts/*.js','!app/scripts/*.min.js'], ['minifyjs']);
});

gulp.task('bower', function() {
	var extraJsFiles = ['bower_components/chardin.js/chardinjs.min.js'];
	var extraCssFiles = ['bower_components/chardin.js/chardinjs.css'];
	gulp.src(plugins.mainBowerFiles().concat(extraJsFiles))
		.pipe(plugins.filter('**/*.js'))
		.pipe(plugins.concat('vendor.js'))
		.pipe(gulp.dest('app/scripts/'))
	gulp.src(plugins.mainBowerFiles().concat(extraCssFiles))
		.pipe(plugins.filter('**/*.css'))
		.pipe(plugins.concat('vendor.css'))
		.pipe(gulp.dest('app/styles'))
});

gulp.task('sass', function() {
	gulp.src(['app/styles/*.scss','!app/styles/_*.scss'])
		.pipe(plugins.logger({
			before: 'Starting Sass...',
			after: 'Sass compiled!',
			extname: '.css',
			showChange: true
		}))
		.pipe(plugins.plumber())
	    .pipe(plugins.sass())
	    .pipe(gulp.dest('app/styles/'));
});
 
gulp.task('minifyjs', function() {
	gulp.src(['app/scripts/*.js','!app/scripts/*.min.js'])
		.pipe(plugins.logger({
			before: 'Starting MinifyJS...',
			after: 'JS Minified!',
			extname: '.min.js',
			showChange: true
		}))
		.pipe(plugins.plumber())
		.pipe(plugins.uglify({ mangle: false }))
	    .pipe(plugins.rename({ suffix: '.min' }))
		.pipe(gulp.dest('app/scripts/'));
});

gulp.task('minifycss', function() {
	gulp.src(['app/styles/*.css','!app/styles/*.min.css'])
		.pipe(plugins.logger({
			before: 'Starting MinifyCSS...',
			after: 'CSS Minified!',
			extname: '.min.css',
			showChange: true
		}))
		.pipe(plugins.plumber())
		.pipe(plugins.rename({ suffix: '.min' }))
		.pipe(plugins.uglifycss())
		.pipe(gulp.dest('app/styles/'))
})