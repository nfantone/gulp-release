'use strict';
/**
 *
 * @class GitflowRelease
 * @module release
 */
const argv = require('yargs')
  .alias('v', 'version')
  .alias('t', 'type')
  .argv;
const fs = require('fs-sync');
const gulp = require('gulp');
const shell = require('gulp-shell');
const gbump = require('gulp-bump');
const git = require('gulp-git');
const codename = require('gulp-codename');
const semver = require('semver');
const _ = require('lodash');

const DEFAULTS = {
  packages: ['package.json']
};

module.exports =
  class GitflowRelease {
    constructor(config) {
      this.config = _.defaults({}, config, DEFAULTS);
    }

    version() {
      return fs.readJSON(this.config.packages[0]).version;
    }

    bump(ver, type) {
      let options = {
        version: ver || argv.version,
        type: type || argv.type
      };
      return gulp.src(this.config.packages)
        .pipe(gbump(options))
        .pipe(codename({ patchname: false }))
        .pipe(gulp.dest('.'));
    }

    start(done) {
      let ver = semver.inc(this.version(), 'patch');
      shell.task(`git flow release start -F ${ver}`, { verbose: true })(done);
    }

    finish(done) {
      let ver = this.version();
      let codename = fs.readJSON(this.config.packages[0]).codename;
      shell.task(`git flow release finish -m '${codename}' ${ver}`, { verbose: true })(done);
    }

    commit(message) {
      return gulp.src(this.config.packages)
        .pipe(git.commit(message, {
          quiet: true
        }));
    }

    push(done) {
      git.push('origin', '*:*', {
        args: '--tags',
        quiet: true
      }, done);
    }
};
