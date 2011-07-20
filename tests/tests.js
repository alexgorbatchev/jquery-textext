var soda   = require('soda'),
	assert = require('assert'),
	common = require('./common')
	;

common.runModule(function(browser)
{
	browser
		.and(require('./test_autocomplete.js'))
		.and(require('./test_tags.js'))
	;
});

