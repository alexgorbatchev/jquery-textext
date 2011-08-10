var soda   = require('soda'),
	assert = require('assert'),
	common = require('./common')
	;

var DOWN  = '\\40',
	UP    = '\\38',
	ESC   = '\\27',
	ENTER = '\\13'
	;

var textarea = common.css.textarea,
	dropdown = common.css.dropdown
	;

function assertTextareaValue(browser)
{
	browser.assertValue(textarea, 'OCAML');
};

function testDropdownFunctionality(finalAssert)
{
	finalAssert = finalAssert || assertTextareaValue;

	return function(browser)
	{
		browser
			.click(textarea)
			
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

			.typeKeys(textarea, 'oca')
			.assertVisible(common.suggestionsXPath(true, 0))
			.keyDown(textarea, ENTER)
			.assertNotVisible(dropdown)

			.and(finalAssert)
			;
	};
};

function testAutocomplete(exampleId, finalAssert)
{
	return function(browser)
	{
		browser
			.open('/manual/plugins/autocomplete/index.html')
			.clickAndWait('css=#example-' + exampleId)

			.and(common.verifyTextExt)
			.and(testDropdownFunctionality(finalAssert))
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

