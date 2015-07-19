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
		var recipes = {
			release: {
				start: taker.series(gitflow.release.start.bump, gitflow.release.start.branch,
					gitflow.release.start.commit),
				finish: taker.series(gitflow.release.finish.merge, gitflow.release.finish.tag,
					gitflow.release.finish.merge, gitflow.release.finish.bumpdev,
					gitflow.release.finish.commit, gitflow.release.finish.clean, gitflow.release.finish.push)
			}
		};
		taker.task('bump', gitflow.bump);
		taker.task('release-start', recipes.release.start);
		taker.task('release-finish', recipes.release.finish);
	};

	return GitflowRegistry;
})();

module.exports = GitflowRegistry;
