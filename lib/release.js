'use strict';

var git = require('gulp-git');
var gutil = require('gulp-util');
var gfutil = require('./util')({prefix: '[gulp-gitflow]'});
var util = require('util');
var GitflowBase = require('./base');

var ReleaseStart = (function () {
	var self;

	function ReleaseStart(config) {
		self = this;
		GitflowBase.call(this, config);
	}

	util.inherits(ReleaseStart, GitflowBase);

	ReleaseStart.prototype.branch = function branch(done) {
		var releaseBranch = self.config.release.branchPrefix + self.version();
		git.checkout(self.config.branches.developBranchName,
			{quiet: true, args: '-b ' + releaseBranch}, done);
		gfutil.log.info('Created branch \'' + gutil.colors.cyan(releaseBranch) + '\' from ' +
			'\'' + gutil.colors.cyan(self.config.branches.developBranchName) + '\'');
	};

	ReleaseStart.prototype.commit = function commit() {
		return GitflowBase.prototype.commit.call(this, gfutil.format('update {0} version', [self.config.packages]));
	};

	return ReleaseStart;
})();

var ReleaseFinish = (function () {
	var self;

	function ReleaseFinish(config) {
		self = this;

		this.parameters = {
			merge: {
				step: 0,
				branches: [config.branches.masterBranchName, config.branches.developBranchName],
				nextBranch: function () {
					var b = this.branches[this.step];
					this.step += 1;
					return b;
				}
			}
		};

		GitflowBase.call(this, config);
	}

	util.inherits(ReleaseFinish, GitflowBase);

	ReleaseFinish.prototype.doWithReleaseBranch = function (fn) {
		git.revParse({
			args: '--symbolic --abbrev-ref=strict --branches=' + self.config.release.branchPrefix + '*',
			quiet: true
		}, function (err, branches) {
			if (err) {
				throw err;
			}
			fn(branches);
		});
	};

	ReleaseFinish.prototype.merge = function merge(done) {
		self.doWithReleaseBranch(function (releaseBranch) {
			var branch = self.parameters.merge.nextBranch();
			git.checkout(branch, {quiet: true}, function () {
				git.merge(releaseBranch, {quiet: true, args: '--no-ff'}, done);
				gfutil.log.info('Merged branch \'' + gutil.colors.cyan(releaseBranch) + '\' into ' +
					'\'' + gutil.colors.cyan(branch) + '\'');
			});
		});
	};

	ReleaseFinish.prototype.tag = function tag(done) {
		var version = self.config.version.tagPrefix + self.version();
		git.tag(version, 'tagging release ' + version, {quiet: true}, done);
		gfutil.log.info('Tagged version \'' + gutil.colors.cyan(version) + '\'');
	};

	ReleaseFinish.prototype.branch = function branch(done) {
		var releaseBranch = self.config.release.branchPrefix + self.version();
		git.checkout(self.config.branches.developBranchName,
			{quiet: true, args: '-b ' + releaseBranch}, done);
		gfutil.log.info('Created branch \'' + gutil.colors.cyan(releaseBranch) + '\' from ' +
			'\'' + gutil.colors.cyan(self.config.branches.developBranchName) + '\'');
	};

	ReleaseFinish.prototype.clean = function clean(done) {
		self.doWithReleaseBranch(function (releaseBranch) {
			git.branch(releaseBranch, {quiet: true, args: '-D'}, done);
			gfutil.log.info('Removed branch \'' + gutil.colors.cyan(releaseBranch) + '\'');
		});
	};

	ReleaseFinish.prototype.bumpdev = function bumpdev(done) {
		var nextVersion = require('semver').inc(self.version(), 'patch');
		return self.bump(done, nextVersion + '-dev');
	};

	ReleaseFinish.prototype.push = function push(done) {
		GitflowBase.prototype.push.call(this, '*:*', '--tags', done);
	};

	ReleaseFinish.prototype.commit = function commit() {
		return GitflowBase.prototype.commit.call(this, 'prepare next development iteration');
	};

	return ReleaseFinish;
})();


var GitflowRelease = (function () {

	function GitflowRelease(config) {
		this.start = new ReleaseStart(config);
		this.finish = new ReleaseFinish(config);
	}

	return GitflowRelease;
})();


module.exports = GitflowRelease;
