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
const isEmpty = require('lodash/isEmpty');

const DEFAULTS = {
  packages: ['package.json']
};

module.exports = class GitflowRelease {
  constructor(config) {
    this.config = Object.assign({}, DEFAULTS, config);
  }

  version() {
    return fs.readJSON(this.config.packages[0]).version;
  }

  bump(ver, type, name, codenames) {
    const options = {
      version: ver,
      type: type ? String(type).toLowerCase() : type
    };
    return gulp
      .src(this.config.packages)
      .pipe(gbump(options))
      .pipe(
        gulpif(
          isEmpty(name),
          codename({
            patchname: false,
            codenames: codenames || this.config.codenames
          }),
          json(data => Object.assign({}, data, { codename: name }), 2)
        )
      )
      .pipe(gulp.dest('.'));
  }

  start(ver, type, done) {
    const release = type ? String(type).toLowerCase() : 'patch';
    const version = ver || semver.inc(this.version(), release);
    shell.task(`git flow release start -F ${version}`, {
      verbose: true
    })(done);
  }

  finish(message, done) {
    const ver = this.version();
    const codename = message || fs.readJSON(this.config.packages[0]).codename;
    shell.task(`git flow release finish -m '${codename}' ${ver}`, {
      verbose: true
    })(done);
  }

  commit(message) {
    return gulp.src(this.config.packages).pipe(
      git.commit(message, {
        quiet: true
      })
    );
  }

  push(done) {
    git.push(
      'origin',
      ['develop', 'master'],
      {
        args: '--tags',
        quiet: true
      },
      done
    );
  }
};
