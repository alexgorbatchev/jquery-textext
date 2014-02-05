var soda   = require('soda'),
	assert = require('assert'),
	common = require('./common')
	;

function testArrow(exampleId, secondary)
{
	return function(browser)
	{
		browser
			.open('/manual/plugins/arrow.html')
			.clickAndWait('css=#example-' + exampleId)

			.and(common.verifyTextExt)
			.and(common.testArrowFunctionality())
			.and(secondary || function(){})
			.and(common.screenshot('arrow-' + exampleId))
			;
	};
}

function run(browser)
{
	browser
		.and(testArrow('arrow-with-autocomplete'))
		.and(testArrow('prompt-with-autocomplete-and-arrow'))
	;
};

module.exports = run;

if(require.main == module)
	common.runModule(run);

