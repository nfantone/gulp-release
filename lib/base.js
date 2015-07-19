'use strict';

var gulp = require('gulp');
var fs = require('fs-sync');
var gutil = require('gulp-util');
var git = require('gulp-git');
var gbump = require('gulp-bump');
var util = require('./util')({prefix: '[gulp-gitflow] '});
var args = require('minimist')(process.argv.slice(2), {
	string: ['version', 'type'],
	alias: {type: 't', version: 'v'}
});

var GitflowBase = (function () {
	var self;

	function GitflowBase(config) {
		self = this;
		this.config = config;
	}

	GitflowBase.prototype.version = function () {
		return fs.readJSON(self.config.packages[0]).version;
	};

	GitflowBase.prototype.push = function push(ref, args, done) {
		git.push('origin', ref, {args: args, quiet: true}, done);
		util.log.info('Pushed branches and tags to \'' + gutil.colors.cyan('origin') + '\'');
	};

	GitflowBase.prototype.tag = function tag(done) {
		var version = self.config.version.tagPrefix + self.version();
		git.tag(version, 'tagging release ' + version, {quiet: true}, done);
		util.log.info('Tagged version \'' + gutil.colors.cyan(version) + '\'');
	};

	GitflowBase.prototype.commit = function commit(message) {
		return gulp.src('.')
			.pipe(git.commit('[gulp-gitflow] '
				+ util.format(message, [self.config.packages]),
				{args: '-a', quiet: true}));
	};

	/**
	 * Bump the version
	 * --type=pre will bump the prerelease version *.*.*-x
	 * --type=patch or no flag will bump the patch version *.*.x
	 * --type=minor will bump the minor version *.x.*
	 * --type=major will bump the major version x.*.*
	 * --version=1.2.3 will bump to a specific version and ignore other flags
	 */
	GitflowBase.prototype.bump = function bump(done, version, type) {
		var options = {
			version: version || args.version,
			type: type || args.type
		};
		return gulp
			.src(self.config.packages)
			.pipe(gbump(options))
			.pipe(gulp.dest('./'));
	};

	return GitflowBase;

})();

module.exports = GitflowBase;
