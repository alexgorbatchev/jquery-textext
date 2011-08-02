var soda   = require('soda'),
	assert = require('assert'),
	common = require('./common')
	;

function testTags(exampleId, wrap)
{
	return function(browser)
	{
		browser
			.open('/manual/plugins/tags/index.html')
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
		.and(testTags('basics'))
		.and(testTags('pre-populating'))
		.and(testTags('custom-labels', function(v) { return '[ ' + v + ' ]' }))
		.and(testTags('custom-rendering'))
		.and(testTags('custom-data-objects'))
	;
};

module.exports = run;

if(require.main == module)
	common.runModule(run);

