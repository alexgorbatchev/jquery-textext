var soda   = require('soda'),
	assert = require('assert'),
	common = require('./common')
	;

var DOWN  = '\\40',
	UP    = '\\38',
	ESC   = '\\27',
	ENTER = '\\13'
	;

var dropdown = 'css=.text-core > .text-wrap > .text-dropdown',
	textarea = 'css=#textarea'
	;

function testDropdownFunctionality(wrap)
{
	return function(browser)
	{
		browser
			.click('css=.text-wrap')
			
			// activate the dropdown
			.keyDown(textarea, DOWN)
			.assertVisible(dropdown)
			.assertVisible(common.suggestionsXPath(true, 0))

			// go to the second item
			.keyDown(textarea, DOWN)
			.assertElementNotPresent(common.suggestionsXPath(true, 0))
			.assertVisible(common.suggestionsXPath(true, 1))

			// go to the third item
			.keyDown(textarea, DOWN)
			.assertElementNotPresent(common.suggestionsXPath(true, 1))
			.assertVisible(common.suggestionsXPath(true, 2))

			// go back up to the second item
			.keyDown(textarea, UP)
			.assertElementNotPresent(common.suggestionsXPath(true, 2))
			.assertVisible(common.suggestionsXPath(true, 1))

			// go back up to the first item
			.keyDown(textarea, UP)
			.assertElementNotPresent(common.suggestionsXPath(true, 1))
			.assertVisible(common.suggestionsXPath(true, 0))

			.typeKeys(textarea, 'ph')
			.assertVisible(common.suggestionsXPath(true, 0))
			.keyDown(textarea, ENTER)
			.assertValue(textarea, 'PHP')
			.assertNotVisible(dropdown)
			;
	};
};

function testAutocomplete(exampleId, wrap)
{
	wrap = wrap || function(v) { return v };

	return function(browser)
	{
		browser
			.open('/manual/plugins/autocomplete/index.html')
			.clickAndWait('css=#example-' + exampleId)

			.and(common.verifyTextExt)
			.and(testDropdownFunctionality(wrap))
			.and(common.screenshot('autocomplete-' + exampleId))
			;
	};
};

function run(browser)
{
	browser
		.and(testAutocomplete('dropdown'))
	;
};

module.exports = run;

if(require.main == module)
	common.runModule(run);

