var soda   = require('soda'),
	assert = require('assert'),
	common = require('./common')
	;

var DOWN = '\\40',
	UP   = '\\38',
	ESC  = '\\27'
	;

var dropdown = 'css=.text-core > .text-wrap > .text-dropdown';

function testDropdownFunctionality(wrap)
{
	return function(browser)
	{
		browser
			.click('css=.text-wrap')
			
			// activate the dropdown
			.keyDown('css=#textarea', DOWN)
			.assertVisible(dropdown)
			.assertVisible(common.suggestionsXPath(true, 0))

			// go to the second item
			.keyDown('css=#textarea', DOWN)
			.assertElementNotPresent(common.suggestionsXPath(true, 0))
			.assertVisible(common.suggestionsXPath(true, 1))

			// go to the third item
			.keyDown('css=#textarea', DOWN)
			.assertElementNotPresent(common.suggestionsXPath(true, 1))
			.assertVisible(common.suggestionsXPath(true, 2))

			// go back up to the second item
			.keyDown('css=#textarea', UP)
			.assertElementNotPresent(common.suggestionsXPath(true, 2))
			.assertVisible(common.suggestionsXPath(true, 1))

			// go back up to the first item
			.keyDown('css=#textarea', UP)
			.assertElementNotPresent(common.suggestionsXPath(true, 1))
			.assertVisible(common.suggestionsXPath(true, 0))

			// go back to the input
			.keyDown('css=#textarea', UP)
			.assertNotVisible(dropdown)

			// test the ESC key
			// .keyDown('css=#textarea', DOWN)
			// .assertVisible(dropdown)
			// .keyDown('css=#textarea', ESC)
			// .assertNotVisible(dropdown)
			;
	};
};

function testAutocomplete(exampleId, wrap)
{
	wrap = wrap || function(v) { return v };

	return function(browser)
	{
		browser
			.open('/')
			.clickAndWait('css=#example-doc-plugins-autocomplete-examples-' + exampleId)

			.and(common.verifyTextExt)
			.and(testDropdownFunctionality(wrap))
			.and(common.screenshot('autocomplete-' + exampleId))
			;
	};
};

function run(browser)
{
	browser
		.and(testAutocomplete('01-dropdown'))
	;
};

module.exports = run;

if(require.main == module)
	common.runModule(run);

