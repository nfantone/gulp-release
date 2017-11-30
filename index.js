'use strict';
/**
 * @module gulp-gitflow
 */
const argv = require('yargs')
  .alias('v', 'version')
  .alias('t', 'type')
  .alias('m', 'message')
  .alias('p', 'push')
  .alias('c', 'codenames')
  .normalize('c').argv;
const compact = require('lodash/compact');
const spread = require('lodash/spread');
const semver = require('semver');
const sequence = require('run-sequence');
const util = require('gulp-util');
const GitflowRelease = require('./lib/release');

// Default config values if none are given
// during plugin initialization
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
    this.options = Object.assign({}, DEFAULTS, options);
  }

  init(taker) {
    let release = new GitflowRelease(this.options);

    taker.task('release:start', done =>
      release.start(argv.version, argv.type, done)
    );
    taker.task('release:finish', done => release.finish(argv.message, done));
    taker.task('release:push', release.push);
    taker.task('release:commit', () =>
      release.commit(this.options.messages.bump)
    );
    taker.task('release:commit:next', () =>
      release.commit(this.options.messages.next)
    );
    taker.task('bump', () => {
      if (argv.version || argv.type) {
        return release.bump(
          argv.version,
          argv.type,
          argv.message,
          argv.codenames
        );
      }
      let ver = semver.inc(release.version(), 'patch');
      return release.bump(ver, null, argv.message);
    });
    taker.task('bump:next', () => {
      const ver = semver.inc(release.version(), 'patch');
      const devSuffix = this.options.devSuffix || '-dev';
      return release.bump(ver + devSuffix, null, argv.message, argv.codenames);
    });

    function done(cb) {
      return () => {
        if (argv.p) {
          util.log(
            util.colors.cyan('[gulp-release]') +
              ' All done: tags and branches pushed to ' +
              util.colors.magenta('origin')
          );
        } else {
          util.log(
            util.colors.cyan('[gulp-release]') +
              ' All done: review changes and push to ' +
              util.colors.magenta('origin')
          );
        }
        return cb();
      };
    }

    const recipes = {
      release: compact([
        'release:start',
        'bump',
        'release:commit',
        'release:finish',
        'bump:next',
        'release:commit:next',
        argv.p ? 'release:push' : undefined
      ])
    };

    taker.task(this.options.tasks.release, cb =>
      spread(sequence)(recipes.release.concat(done(cb)))
    );
  }
}

module.exports = {
  register: function(taker, options) {
    const registry = new GitflowRegistry(options);
    registry.init(taker);
  }
};
