var soda   = require('soda'),
	assert = require('assert'),
	common = require('./common')
	;

function testAutocomplete(exampleId, finalAssert)
{
	return function(browser)
	{
		browser
			.open('/manual/plugins/autocomplete.html')
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
		.and(testAutocomplete('autocomplete'))
		.and(testAutocomplete('autocomplete-with-filter'))
		.and(testAutocomplete('autocomplete-with-custom-render'))
		.and(testAutocomplete('autocomplete-with-tags', common.testTagFunctionality()))
		.and(testAutocomplete('autocomplete-with-tags-and-filter', common.testFilterFunctionality()))
	;
};

module.exports = run;

if(require.main == module)
	common.runModule(run);

