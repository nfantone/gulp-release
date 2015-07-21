'use strict';

var _ = require('lodash');
var util = require('./util');
var glob = require('glob');

var gitflowConfig = (function() {

	function GitflowConfig(options) {
		// Defaults to Array of packages (options object may contain a string value)
		if (options && options.hasOwnProperty('packages')) {
			options.packages = _.flatten([options.packages]);
		}

		var config = _.defaults(options || {}, GitflowConfig.DEFAULTS);
		var packages = [];

		// Expand possible globs and filter out needless one
		_.forEach(config.packages, function (p) {
			var globs = glob.sync(p);
			if (_.isEmpty(globs)) {
				util.log.warn('Package \'' + p + '\' does not match any known files (will be ignored)');
			} else {
				packages.push.apply(packages, globs);
			}
		});

		config.packages = packages;

		_.extend(this, config);
	}

	GitflowConfig.DEFAULTS = {
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

	return GitflowConfig;
})();

module.exports = gitflowConfig;
