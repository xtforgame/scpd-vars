import gulp from 'gulp';
import path from 'path';
import {
  libraryTasks,
} from 'az-gulp-env-lite';

import gulpConfig from '../../.azdata/gulp-config';
libraryTasks.addTasks(gulpConfig);
