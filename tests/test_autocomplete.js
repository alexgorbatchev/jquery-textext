var soda   = require('soda'),
	assert = require('assert'),
	common = require('./common')
	;

function testAutocomplete(exampleId, finalAssert)
{
	return function(browser)
	{
		browser
			.open('/manual/plugins/autocomplete/index.html')
			.clickAndWait('css=#example-' + exampleId)

			.and(common.verifyTextExt)
			.and(common.testAutocompleteFunctionality(finalAssert))
			.and(common.screenshot('autocomplete-' + exampleId))
			;
	};
};

function run(browser)
{
	browser
		.and(testAutocomplete('basics'))
		.and(testAutocomplete('with-filter'))
		.and(testAutocomplete('with-tags', common.testTagFunctionality()))
		.and(testAutocomplete('with-tags-and-filter', common.testFilterFunctionality()))
	;
};

module.exports = run;

if(require.main == module)
	common.runModule(run);

