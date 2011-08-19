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

function run(browser)
{
	browser
		.and(testFilter('filter-with-static-list-of-items'))
		.and(testFilter('filter-using-suggestions'))
	;
};

module.exports = run;

if(require.main == module)
	common.runModule(run);

