var soda   = require('soda'),
	assert = require('assert'),
	common = require('./common')
	;

function testBasicTagFunctionality(wrap)
{
	return function(browser)
	{
		browser
			.click('css=.text-wrap')

			.and(common.typeTag('hello', wrap))
			.and(common.typeTag('world', wrap))
			.and(common.typeTag('word1', wrap))
			.and(common.typeTag('word2', wrap))
			.and(common.typeTag('word3', wrap))

			.and(common.closeTag('word2', wrap))
			.and(common.closeTag('word1', wrap))
			.and(common.closeTag('word3', wrap))
			;
	};
};

function testTags(exampleId, wrap)
{
	wrap = wrap || function(v) { return v };

	return function(browser)
	{
		browser
			.open('/manual/plugins/tags/index.html')
			.clickAndWait('css=#example-' + exampleId)

			.and(common.verifyTextExt)
			.and(testBasicTagFunctionality(wrap))
			.and(common.screenshot('tags-' + exampleId))
			;
	};
};

function run(browser)
{
	browser
		.and(testTags('plain'))
		.and(testTags('pre-populating-tags'))
		.and(testTags('custom-object', function(v) { return '[ ' + v + ' ]' }))
		.and(testTags('basic-rendering'))
	;
};

module.exports = run;

if(require.main == module)
	common.runModule(run);

