'use strict';

var gutil = require('gulp-util');

var util = {};
util.log = (function () {
	return {
		prefix: '',
		warn: function (message) {
			gutil.log(this.prefix + gutil.colors.yellow('WARNING - ' + message));
		},
		info: function (message) {
			gutil.log(this.prefix + message);
		},
		error: function (message) {
			gutil.log(this.prefix + gutil.colors.red('ERROR - ' + message));
		}
	};
})();

util.format = function (format, args) {
	return format.replace(/{(\d+)}/g, function (match, number) {
		return typeof args[number] !== 'undefined'
			? args[number]
			: match;
	});
};

module.exports = function (options) {
	if (options) {
		util.log.prefix = options.prefix || util.log.prefix;
	}
	return util;
};
