'use strict';

var GitflowConfig = require('./config');
var GitflowRelease = require('./release');

var gitflow = (function() {
	function Gitflow(options) {
		var config = new GitflowConfig(options);
		this.release = new GitflowRelease(config);
	}
	return Gitflow;
})();

module.exports = gitflow;
