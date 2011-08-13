var soda   = require('soda'),
	assert = require('assert'),
	common = require('./common')
	;

function testPrompt(exampleId, secondary)
{
	return function(browser)
	{
		browser
			.open('/manual/plugins/prompt/index.html')
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
		.and(testPrompt('plain', common.testPlainInputFunctionality()))
		.and(testPrompt('with-autocomplete', common.testAutocompleteFunctionality()))
		.and(testPrompt('with-tags', common.testTagFunctionality()))
	;
};

module.exports = run;

if(require.main == module)
	common.runModule(run);

