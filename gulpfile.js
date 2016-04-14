// generated on 2015-11-20 using generator-gulp-webapp 1.0.3
var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var browserSync = require('browser-sync');
var del = require('del');
var stream = require('wiredep');
var wiredep = require('wiredep');

var $ = gulpLoadPlugins();
var reload = browserSync.reload;
var ejs = require('gulp-ejs');
var minifyCss = require('gulp-minify-css');
var filter = require('gulp-filter'); // 文件筛选
var jsFilter = filter("**/*.js",{restore:true});
var cssFilter = filter("**/*.css",{restore:true});
var htmlFilter = filter("**/*.html",{restore:true});

var config = {
  dist:{"html":"dist/html","css":"dist/css","scripts":"dist/scripts","dist":"dist","images":"dist/images"}
};

gulp.task('sass', function () {
  return gulp.src('app/sass/**/*.scss')
    //.pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({browsers: ['last 1 version']}))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('app/css'))
    .pipe(reload({stream: true}));
});

function lint(files, options) {
  return function () {
    return gulp.src(files)
      .pipe(reload({stream: true, once: true}))
      .pipe($.eslint(options))
      .pipe($.eslint.format())
      .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
  };
}


gulp.task('lint', lint('app/scripts/**/*.js'));

gulp.task('html', function () {
  const assets = $.useref.assets({searchPath: ['app', '.']});
  return gulp.src('app/html/**/*.html')
    .pipe(assets)
    .pipe(jsFilter)
    .pipe($.if('*.js', $.uglify()))
    .pipe(gulp.dest(config.dist["dist"]))
    .pipe(jsFilter.restore)
    .pipe(cssFilter)
    .pipe($.if('*.css', $.minifyCss({compatibility: '*'})))
    .pipe(gulp.dest(config.dist["dist"]))
    .pipe(cssFilter.restore)
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe(htmlFilter)
    //.pipe($.if('*.html', $.minifyHtml({conditionals: true, loose: true})))
    .pipe(gulp.dest('dist/html'));
});

gulp.task('images', function () {
  return gulp.src('app/images/**/*')
    .pipe($.if($.if.isFile, $.cache($.imagemin({
      progressive: true,
      interlaced: true,
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{cleanupIDs: false}]
    }))
      .on('error', function (err) {
        console.log(err);
        this.end();
      })))
    .pipe(gulp.dest('dist/images'));
});

//js文件 检查压缩
gulp.task("js",function(){
  return gulp.src(["app/scripts/**/*.js","!app/scripts/config.js"])
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.uglify())
    .pipe(gulp.dest('dist/scripts'));
});

//css 压缩
gulp.task("css",function() {
  return gulp.src("app/css/**/*.css")
    .pipe(minifyCss())
    .pipe(gulp.dest('dist/css'));
});

//额外任务
gulp.task('extras', function () {
  return gulp.src([
    'app/**/*.*',
    '!app/sass/**/*.*',
    '!app/*.html',
    '!app/html_src/**/*.*',
    '!app/html/**/*.html',
    '!app/images/**/*',
    '!app/scripts/*',
    '!app/css/*'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});


/*html中include功能依赖此任务*/
gulp.task('ejs', function () {
  return gulp.src(["app/html_src/**/*.html","!app/html_src/module/**/*.html"])
    .pipe(ejs())
    .pipe(gulp.dest("app/html"));
});

//清除
gulp.task('clean:dist', del.bind(null, ['dist']));
gulp.task("clean:html", del.bind(null, ['app/html']));
gulp.task("clean:css", del.bind(null, ['app/css']));

gulp.task("clean:app",function(){
  gulp.start(["clean:html","clean:css"]);
});
gulp.task("clean",function(){
  gulp.start(["clean:app","clean:dist"]);
});

//本地服务
gulp.task('serve', ['sass', 'ejs'], function () {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['app'],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch([
    'app/html_src/**/*.html',
    'app/scripts/**/*.js',
    'app/images/**/*'
  ]).on('change', reload);

  gulp.watch('app/sass/**/*.scss', ['sass']);
  gulp.watch('app/html_src/**/*.html', ['ejs']);
  gulp.watch('bower.json', ['wiredep']);
});

gulp.task('serve:dist', function () {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['dist']
    }
  });
});

gulp.task('serve:test', function () {
  browserSync({
    notify: false,
    port: 9000,
    ui: false,
    server: {
      baseDir: 'test',
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });


});

// inject bower components
gulp.task('wiredep', function () {
  gulp.src('app/sass/*.scss')
    .pipe(wiredep({
      //exclude: ['bootstrap.js'],
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('app/sass'));
});

//打包
gulp.task('build', ['lint', 'ejs', 'sass', 'html', 'images', 'js', 'css', 'extras'], function () {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean:dist'], function () {
  gulp.start('build');
});
