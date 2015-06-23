'use strict';

var gulp = require('gulp');
var _ = require('lodash');
var glob = require('glob');
var fs = require('fs-sync');
var $ = require('gulp-load-plugins')({lazy: true});
var util = require('./util')({prefix: '[gulp-gitflow] '});
var args = require('minimist')(process.argv.slice(2));

var Gitflow = (function () {
	var self;

	function Gitflow(options) {
		self = this;

		this.defaults = {
			branches: {
				developBranchName: 'develop',
				masterBranchName: 'master'
			},
			release: {
				branchPrefix: 'release/'
			},
			version: {
				tagPrefix: ''
			},
			packages: ['package.json']
		};

		this.config = this.buildConfig(options);

		this.parameters = {
			'release-start': {
				commit: {
					message: 'update {0} version'
				}

			},
			'release-finish': {
				commit: {
					message: 'prepare next development iteration'
				},
				merge: {
					step: 0,
					branches: [self.config.branches.masterBranchName, self.config.branches.developBranchName],
					nextBranch: function () {
						var b = this.branches[this.step];
						this.step += 1;
						return b;
					}
				}
			},
			get: function () {
				return this[process.argv.slice(2)[0]];
			}
		};
	}

	Gitflow.prototype.version = function () {
		return fs.readJSON(self.config.packages[0]).version;
	};

	Gitflow.prototype.buildConfig = function (options) {
		var config = {};

		try {
			var configPath = './config';
			if (args.config) {
				configPath = require('path').resolve(args.config);
			}
			config = require(configPath);

			// Defaults to Array of packages (json file might contain a string value)
			var packages = _.flatten([config.gitflow.packages]);
			config.gitflow.packages = [];

			// Expand possible globs
			_.forEach(packages, function (p) {
				var globs = glob.sync(p);
				if (_.isEmpty(globs)) {
					util.log.warn('Package \'' + p + '\' does not match any known files (will be ignored)');
				} else {
					config.gitflow.packages.push.apply(config.gitflow.packages, globs);
				}
			});
		} catch (e) {
			util.log.warn('Bad or no JSON config file found (using defaults)');
		}

		return _.defaults(options || {}, config.gitflow, self.defaults);
	};

	Gitflow.prototype.doWithReleaseBranch = function (fn) {
		$.git.revParse({
			args: '--symbolic --abbrev-ref=strict --branches=' + self.config.release.branchPrefix + '*',
			quiet: true
		}, function (err, branches) {
			if (err) {
				throw err;
			}
			fn(branches);
		});
	};

	Gitflow.prototype.push = function push(done) {
		$.git.push('origin', '*:*', {args: '--tags', quiet: true}, done);
		util.log.info('Pushed branches and tags to \'' + $.util.colors.cyan('origin') + '\'');
	};

	Gitflow.prototype.merge = function merge(done) {
		self.doWithReleaseBranch(function (releaseBranch) {
			var branch = self.parameters.get().merge.nextBranch();
			$.git.checkout(branch, {quiet: true}, function () {
				$.git.merge(releaseBranch, {quiet: true, args: '--no-ff'}, done);
				util.log.info('Merged branch \'' + $.util.colors.cyan(releaseBranch) + '\' into ' +
					'\'' + $.util.colors.cyan(branch) + '\'');
			});
		});
	};

	Gitflow.prototype.tag = function tag(done) {
		var version = self.config.version.tagPrefix + self.version();
		$.git.tag(version, 'tagging release ' + version, {quiet: true}, done);
		util.log.info('Tagged version \'' + $.util.colors.cyan(version) + '\'');
	};

	Gitflow.prototype.branch = function branch(done) {
		var releaseBranch = self.config.release.branchPrefix + self.version();
		$.git.checkout(self.config.branches.developBranchName,
			{quiet: true, args: '-b ' + releaseBranch}, done);
		util.log.info('Created branch \'' + $.util.colors.cyan(releaseBranch) + '\' from ' +
			'\'' + $.util.colors.cyan(self.config.branches.developBranchName) + '\'');
	};

	Gitflow.prototype.clean = function clean(done) {
		self.doWithReleaseBranch(function (releaseBranch) {
			$.git.branch(releaseBranch, {quiet: true, args: '-D'}, done);
			util.log.info('Removed branch \'' + $.util.colors.cyan(releaseBranch) + '\'');
		});
	};

	Gitflow.prototype.commit = function commit() {
		return gulp.src('.')
			.pipe($.git.commit('[gulp-gitflow] '
				+ util.format(self.parameters.get().commit.message, [self.config.packages]),
				{args: '-a', quiet: true}));
	};

	Gitflow.prototype.bumpdev = function bumpdev(done) {
		var nextVersion = require('semver').inc(self.version(), 'patch');
		return self.bump(done, nextVersion + '-dev');
	};

	/**
	 * Bump the version
	 * --type=pre will bump the prerelease version *.*.*-x
	 * --type=patch or no flag will bump the patch version *.*.x
	 * --type=minor will bump the minor version *.x.*
	 * --type=major will bump the major version x.*.*
	 * --version=1.2.3 will bump to a specific version and ignore other flags
	 */
	Gitflow.prototype.bump = function bump(done, version, type) {
		var options = {
			version: version || args.version,
			type: type || args.type
		};
		return gulp
			.src(self.config.packages)
			.pipe($.bump(options))
			.pipe(gulp.dest('./'));
	};

	return Gitflow;

})();

module.exports = Gitflow;
