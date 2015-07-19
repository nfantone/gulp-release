'use strict';

var GitflowConfig = require('./config');
var GitflowRelease = require('./release');

var Gitflow = (function() {
	function Gitflow(options) {
		var config = new GitflowConfig(options);
		this.release = new GitflowRelease(config);
	}
	return Gitflow;
})();

module.exports = Gitflow;
