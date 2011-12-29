var soda   = require('soda'),
	assert = require('assert'),
	common = require('./common')
	;

function testFilter(exampleId)
{
	return function(browser)
	{
		browser
			.open('/manual/plugins/filter.html')
			.clickAndWait('css=#example-' + exampleId)

			.and(common.verifyTextExt)
			.and(common.testFilterFunctionality())
			.and(common.screenshot('filter-' + exampleId))
			;
	};
};

function testTags()
{
	return function(browser)
	{
		browser
			.and(common.typeAndValidateTag('PHP'))
			.and(common.typeAndValidateTag('Ruby'))
			.and(common.typeAndValidateTag('Go'))
			;
	};
};

function run(browser)
{
	browser
		.and(testFilter('filter-with-static-list-of-items'))
		.and(testTags())

		.and(testFilter('filter-using-suggestions'))
		.and(testTags())

		.and(testFilter('autocomplete-with-filter'))
		.and(testFilter('filter'))
	;
};

module.exports = run;

if(require.main == module)
	common.runModule(run);

