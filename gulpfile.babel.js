import gulp from 'gulp';
import path from 'path';
import {
  GulpConfig,
  libraryTasks,
  testTasks,
} from 'az-gulp-env';

const projRoot  = path.resolve(__dirname);
var config = {
  projRoot,
  base: projRoot,
  submodules: {
    library: {
      prefix: 'library',
      entry: {
        dir: 'src',
        js: {
          glob: '**/*.js',
        },
      },
      output: {
        default: {
          dir: 'dist',
        },
        //dev: {},
        //dist: {},
      },
    },
    test: {
      prefix: 'test',
      entry: {
        dir: 'test_es6',
        js: {
          glob: '**/*.js',
        },
      },
      output: {
        default: {
          dir: 'test',
        },
        //dev: {},
        //dist: {},
      },
    }
  },
};

var gulpConfig = new GulpConfig(config);

libraryTasks.addTasks(gulpConfig);
testTasks.addTasks(gulpConfig);

let libraryConfig = gulpConfig.getSubmodule("library");
gulp.task('watch', libraryConfig.addPrefix(['watch']));
gulp.task('build', libraryConfig.addPrefix(['build']));

gulp.task('default', function() {
  console.log('Run "gulp watch or gulp build"');
});
