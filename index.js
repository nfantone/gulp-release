'use strict';

var util = require('util');
var Gitflow = require('./lib/gitflow');
var DefaultRegistry = require('undertaker-registry');

var GitflowRegistry = (function () {

	function GitflowRegistry(options) {
		this.options = options;
		DefaultRegistry.call(this);
	}

	util.inherits(GitflowRegistry, DefaultRegistry);

	GitflowRegistry.prototype.init = function init(taker) {
		var gitflow = new Gitflow(this.options);

		var recipes = {release: {}};
		recipes.bump = gitflow.bump;
		recipes.release.start = taker.series(gitflow.bump, gitflow.branch, gitflow.commit);

		recipes.release.finish = taker.series(gitflow.merge, gitflow.tag, gitflow.merge,
			gitflow.bumpdev, gitflow.commit, gitflow.clean, gitflow.push);
		taker.task('bump', recipes.bump);
		taker.task('release-start', recipes.release.start);
		taker.task('release-finish', recipes.release.finish);
	};

	return GitflowRegistry;
})();

module.exports = GitflowRegistry;
