var soda   = require('soda'),
	assert = require('assert'),
	common = require('./common')
	;

function testPrompt(exampleId, secondary)
{
	return function(browser)
	{
		browser
			.open('/manual/plugins/prompt.html')
			.clickAndWait('css=#example-' + exampleId)

			.and(common.verifyTextExt)
			.and(common.testPromptFunctionality(secondary))
			.and(common.screenshot('prompt-' + exampleId))
			;
	};
};

function run(browser)
{
	browser
		.and(testPrompt('prompt', common.testPlainInputFunctionality()))
		.and(testPrompt('prompt-with-autocomplete-and-arrow', function(browser)
		{
			browser
				.and(common.testArrowFunctionality())
				.and(common.testAutocompleteFunctionality())
				;
		}))
		.and(testPrompt('prompt-with-tags', common.testTagFunctionality()))
	;
};

module.exports = run;

if(require.main == module)
	common.runModule(run);

