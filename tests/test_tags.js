var soda   = require('soda'),
	assert = require('assert'),
	common = require('./common')
	;

function testTags(exampleId, wrap)
{
	return function(browser)
	{
		browser
			.open('/manual/plugins/tags.html')
			.clickAndWait('css=#example-' + exampleId)

			.and(common.verifyTextExt)
			.and(common.testTagFunctionality(wrap))
			.and(common.screenshot('tags-' + exampleId))
			;
	};
};

function run(browser)
{
	browser
		.and(testTags('tags'))
		.and(testTags('tags-with-items'))
		.and(testTags('tags-with-custom-labels', { label: function(v) { return '[ ' + v + ' ]' } }))
		.and(testTags('tags-with-custom-rendering'))
		.and(testTags('tags-with-custom-data-objects', { object: function(v) { return { name : v } }} ))
	;
};

module.exports = run;

if(require.main == module)
	common.runModule(run);

