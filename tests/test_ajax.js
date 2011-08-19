var soda   = require('soda'),
	assert = require('assert'),
	common = require('./common')
	;

function beginAjaxTest(exampleId, test)
{
	return function(browser)
	{
		browser
			.open('/manual/plugins/ajax.html')
			.clickAndWait('css=#example-' + exampleId)
			.and(common.verifyTextExt)
			.and(test)
			.and(common.screenshot('ajax-' + exampleId))
			;
	};
};

function testLoadingMessage()
{
	function inject()
	{
		var originalAjax = $.ajax;
		
		$.ajax = function()
		{
			var args = arguments,
				self = this
				;

			setTimeout(
				function()
				{
					originalAjax.apply(self, args);
				}, 
				1000
			);
		};
	};

	return function(browser)
	{
		browser.and(
			beginAjaxTest('ajax-with-autocomplete', function(browser)
			{
				var loadingMessage = common.css.dropdown + ' .text-suggestion.text-loading';

				browser
					.runScript("(" + inject.toString() + ")();")

					.and(common.focusInput)

					.typeKeys(common.css.textarea, 'ba')
					.waitForVisible(common.css.dropdown)

					// since we delayed AJAX call in the test, the loading message
					// should show up for us before the items are loaded
					.assertVisible(loadingMessage)

					// wait for the loading message to disappear
					.waitForElementNotPresent(loadingMessage)

					// verify that suggestion is present
					.and(common.assertSuggestionItem('Basic'))

					// run the autocomplete tests
					.and(common.clearInput)
					.and(common.testAutocompleteFunctionality())
					;
			})
		);
	};
};

function testWithTags()
{
	return function(browser)
	{
		browser.and(
			beginAjaxTest('ajax-with-filter-tags-and-autocomplete', function(browser)
			{
				browser
					.and(common.testAjaxFunctionality())
					.and(common.clearInput)
					.and(common.testAutocompleteFunctionality(function() {}))
					.and(common.testFilterFunctionality())
					;
			})
		);
	};
};

function run(browser)
{
	browser
		.and(testLoadingMessage())
		.and(testWithTags())
	;
};

module.exports = run;

if(require.main == module)
	common.runModule(run);

