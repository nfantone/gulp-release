'use strict';

var gulp = require('gulp');
var util = require('util');
var Gitflow = require('./lib/gitflow');
var DefaultRegistry = require('undertaker-registry');

var GitflowRegistry = (function () {
	function GitflowRegistry(options) {
		DefaultRegistry.call(this);

		var gitflow = new Gitflow(options);
		var recipes = {release: {}};

		recipes.bump = gitflow.bump;
		recipes.release.start = gulp.series(gitflow.bump, gitflow.branch, gitflow.commit);
		recipes.release.finish = gulp.series(gitflow.merge, gitflow.tag, gitflow.merge,
			gitflow.bumpdev, gitflow.commit, gitflow.clean, gitflow.push);

		this.set('bump', recipes.bump);
		this.set('release-start', recipes.release.start);
		this.set('release-finish', recipes.release.finish);

	}

	util.inherits(GitflowRegistry, DefaultRegistry);

	return GitflowRegistry;
})();

module.exports = GitflowRegistry;
