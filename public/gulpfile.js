var gulp = require('gulp'),
	plugins = require("gulp-load-plugins")({
		pattern: ['gulp-*', 'gulp.*', 'main-bower-files'],
		replaceString: /\bgulp[\-.]/
	});

// Define default destination folder
var dest = 'app/';
 
gulp.task('sass', function() {
  gulp.src('app/styles/*.scss')
    .pipe(plugins.sass())
    .pipe(gulp.dest('app/styles/'))
    .pipe(plugins.livereload({ start: true }));
});
 
gulp.task('watch', function() {
  livereload.listen();
  gulp.watch('app/styles/*.scss', ['sass']);
});

gulp.task('default', function() {
  gulp.src('app/styles/*.scss')
    .pipe(plugins.sass())
    .pipe(gulp.dest('app/styles/'))
    .pipe(plugins.livereload({ start: true }));
});

gulp.task('bower', function() {
	var extraJsFiles = ['bower_components/chardin.js/chardinjs.min.js'];
	var extraCssFiles = ['bower_components/chardin.js/chardinjs.css'];
	gulp.src(plugins.mainBowerFiles().concat(extraJsFiles))
		.pipe(plugins.filter('**/*.js'))
		.pipe(plugins.concat('vendor.js'))
//		.pipe(plugins.uglify())
		.pipe(gulp.dest('app/scripts/'));

	gulp.src(plugins.mainBowerFiles().concat(extraCssFiles))
		.pipe(plugins.filter('**/*.css'))
		.pipe(plugins.concat('vendor.css'))
		.pipe(gulp.dest('app/styles'));

});