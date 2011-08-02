var soda   = require('soda'),
	assert = require('assert'),
	common = require('./common')
	;

function testFilter(exampleId)
{
	return function(browser)
	{
		browser
			.open('/manual/plugins/filter/index.html')
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
		.and(testFilter('with-static-list-of-items'))
		.and(testFilter('using-suggestions'))
	;
};

module.exports = run;

if(require.main == module)
	common.runModule(run);

