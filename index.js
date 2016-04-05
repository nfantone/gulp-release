'use strict';
/**
 *
 * @module gulp-gitflow
 * @class GitflowRegistry
 */
const argv = require('yargs')
  .alias('v', 'version')
  .alias('t', 'type')
  .default('t', 'patch')
  .alias('p', 'push')
  .argv;
const _ = require('lodash');
const semver = require('semver');
const sequence = require('gulp-sequence');
const util = require('gulp-util');
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

    taker.task('release:start', (done) => release.start(done));
    taker.task('release:finish', (done) => release.finish(done));
    taker.task('release:push', release.push);
    taker.task('release:commit', () => release.commit(this.options.messages.bump));
    taker.task('release:commit:next', () => release.commit(this.options.messages.next));
    taker.task('bump:next', () => {
      let ver = semver.inc(argv.version || release.version(), argv.type);
      return release.bump(ver + '-dev');
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
        argv.p ? 'release:push' :
        () => util.log(util.colors.cyan('[gulp-release]') + ' All done: review changes and push to origin'))
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
