'use strict';
/**
 * @module lib/release
 */
const fs = require('fs-sync');
const gulp = require('gulp');
const shell = require('gulp-shell');
const gbump = require('gulp-bump');
const gulpif = require('gulp-if');
const json = require('gulp-json-transform');
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

    bump(ver, type, name, codenames) {
      let options = {
        version: ver,
        type: type
      };
      return gulp.src(this.config.packages)
        .pipe(gbump(options))
        .pipe(gulpif(_.isEmpty(name),
          codename({ patchname: false, codenames }),
          json(function(data) {
            data.codename = name;
            return data;
          }, 2)
        ))
        .pipe(gulp.dest('.'));
    }

    start(ver, type, done) {
      if (!ver) {
        ver = semver.inc(this.version(), type || 'patch');
      }
      shell.task(`git flow release start -F ${ver}`, { verbose: true })(done);
    }

    finish(message, done) {
      let ver = this.version();
      let codename = message || fs.readJSON(this.config.packages[0]).codename;
      shell.task(`git flow release finish -m '${codename}' ${ver}`, { verbose: true })(done);
    }

    commit(message) {
      return gulp.src(this.config.packages)
        .pipe(git.commit(message, {
          quiet: true
        }));
    }

    push(done) {
      git.push('origin', ['develop', 'master'], {
        args: '--tags',
        quiet: true
      }, done);
    }
};
