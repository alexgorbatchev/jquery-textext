var soda   = require('soda'),
	assert = require('assert'),
	common = require('./common')
	;

var focus    = common.css.focus,
	textarea = common.css.textarea
	;

function testFocusFunctionality(browser)
{
	browser
		.fireEvent(textarea, 'focus')
		.waitForVisible(focus)
		.fireEvent(textarea, 'blur')
		.waitForNotVisible(focus)
		;
};

function testFocus(exampleId)
{
	return function(browser)
	{
		browser
			.open('/manual/plugins/focus.html')
			.clickAndWait('css=#example-' + exampleId)

			.and(common.verifyTextExt)
			.and(testFocusFunctionality)
			.and(common.screenshot('focus-' + exampleId))
			;
	};
};

function run(browser)
{
	browser
		.and(testFocus('focus'))
	;
};

module.exports = run;

if(require.main == module)
	common.runModule(run);

