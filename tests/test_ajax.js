var soda   = require('soda'),
	assert = require('assert'),
	common = require('./common')
	;

function ajaxTest(exampleId, test)
{
	return function(browser)
	{
		browser
			.open('/manual/plugins/ajax/index.html')
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
			ajaxTest('with-autocomplete', function(browser)
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
					.and(common.keyPress(27))
					.type(common.css.textarea, '')
					.and(common.testAutocompleteFunctionality())
					;
			})
		);
	};
};

function run(browser)
{
	browser
		.and(testLoadingMessage())
	;
};

module.exports = run;

if(require.main == module)
	common.runModule(run);

