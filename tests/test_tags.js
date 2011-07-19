var soda   = require('soda'),
	assert = require('assert'),
	common = require('./common')
	;

var browser = soda.createClient({
	host    : 'localhost',
	port    : 4444,
	url     : 'http://localhost:9778',
	browser : 'firefox'
});

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

browser.on('command', common.log);
browser.chain.session()

	.windowMaximize()

	.and(testTags('01-plain'))
	.and(testTags('02-pre-populating-tags'))
	.and(testTags('03-custom-object', function(v) { return '[ ' + v + ' ]' }))
	.and(testTags('04-basic-rendering'))

	.testComplete()
	
	.end(function(err)
	{
		if (err) throw err;
		common.echo('ALL DONE');
	})
;

