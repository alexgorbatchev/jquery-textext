var soda   = require('soda'),
	assert = require('assert'),
	common = require('./common')
	;

function testFilterFunctionality(browser)
{
	browser
		.click('css=.text-wrap')

		.and(common.typeTag('hello'))
		.and(common.assertTagNotPresent('hello'))
		.and(common.typeTag('world'))
		.and(common.assertTagNotPresent('world'))

		.and(common.typeAndValidateTag('PHP'))
		.and(common.typeAndValidateTag('Ruby'))
		.and(common.typeAndValidateTag('Go'))
		;
};

function testFilter(exampleId)
{
	return function(browser)
	{
		browser
			.open('/manual/plugins/filter/index.html')
			.clickAndWait('css=#example-' + exampleId)

			.and(common.verifyTextExt)
			.and(testFilterFunctionality)
			.and(common.screenshot('filter-' + exampleId))
			;
	};
};

function run(browser)
{
	browser
		.and(testFilter('using-static-list-of-items'))
		.and(testFilter('using-suggestions'))
	;
};

module.exports = run;

if(require.main == module)
	common.runModule(run);

