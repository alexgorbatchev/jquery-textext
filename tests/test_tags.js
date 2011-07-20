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
			.open('/')
			.clickAndWait('css=#example-doc-plugins-tags-examples-' + exampleId)

			.and(common.verifyTextExt)
			.and(testBasicTagFunctionality(wrap))
			.and(common.screenshot('tags-' + exampleId))
			;
	};
};

function run(browser)
{
	browser
		.and(testTags('01-plain'))
		.and(testTags('02-pre-populating-tags'))
		.and(testTags('03-custom-object', function(v) { return '[ ' + v + ' ]' }))
		.and(testTags('04-basic-rendering'))
	;
};

module.exports = run;

if(require.main == module)
	common.runModule(run);

