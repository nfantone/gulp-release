'use strict';
/**
 *
 * @module gulp-gitflow
 * @class GitflowRegistry
 */
const _ = require('lodash');
const semver = require('semver');
const sequence = require('gulp-sequence');
const GitflowRelease = require('./lib/release');

const DEFAULTS = {
  tasks: {
    release: 'release'
  },
  messages: {
    bump: 'Bump release version',
    next: 'Set next development version'
  }
};

class GitflowRegistry {
  constructor(options) {
    this.options = _.defaults({}, options, DEFAULTS);
  }

  init(taker) {
    let release = new GitflowRelease(this.options);

    taker.task('release:start', _.bind(release.start, release));
    taker.task('release:finish', _.bind(release.finish, release));
    taker.task('release:push', _.bind(release.push, release));
    taker.task('release:commit', () => {
      return release.commit(this.options.messages.bump);
    });
    taker.task('release:commit:next', () => {
      return release.commit(this.options.messages.next);
    });
    taker.task('bump:next', () => {
      let ver = semver.inc(release.version(), 'patch');
      release.bump(ver + '-dev');
    });
    taker.task('bump', () => {
      let ver = semver.inc(release.version(), 'patch');
      return release.bump(ver);
    });

    let recipes = {
      release: sequence('release:start',
        'bump',
        'release:commit',
        'release:finish',
        'bump:next',
        'release:commit:next',
        'release:push')
    };

    taker.task(this.options.tasks.release, recipes.release);
  }
}

module.exports = {
  register: function(taker, options) {
    var registry = new GitflowRegistry(options);
    registry.init(taker);
  }
};
