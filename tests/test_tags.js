var soda   = require('soda'),
	assert = require('assert')
	;

var browser = soda.createClient({
	host    : 'localhost',
	port    : 4444,
	url     : 'http://localhost:9778',
	browser : 'firefox'
});

function log(cmd, args)
{
	args = Array.prototype.slice.apply(arguments);
	cmd  = args.shift();
	console.log(' \x1b[33m%s\x1b[0m%s', cmd, args.length > 0 ? ': ' + args.join(', ') : '');
};

function echo(msg)
{
	log('echo', msg);
};

function verifyTextExt(browser)
{
	browser
		.assertElementPresent('css=.text-core > .text-wrap > #textarea')
		;
};

function tagXPath(value)
{
	return '//div[@class="text-core"]//div[@class="text-tags"]//span[text()="' + value + '"]/../..';
};

function assertTagPresent(value)
{
	return function(browser) { browser.assertElementPresent(tagXPath(value)) };
};

function assertTagNotPresent(value)
{
	return function(browser) { browser.assertElementNotPresent(tagXPath(value)) };
};

function typeTag(value, wrap)
{
	return function(browser)
	{
		browser
			.type('css=#textarea', value)
			.keyDown('css=#textarea', '\\13')
			.and(assertTagPresent(wrap(value)))
			;
	};
};

function closeTag(value, wrap)
{
	return function(browser)
	{
		browser
			.click(tagXPath(wrap(value)) + '//a[@class="text-remove"]')
			.and(assertTagNotPresent(wrap(value)))
			;
	};
};

function testBasicTagFunctionality(wrap)
{
	return function(browser)
	{
		browser
			.click('css=.text-wrap')

			.and(typeTag('hello', wrap))
			.and(typeTag('world', wrap))
			.and(typeTag('word1', wrap))
			.and(typeTag('word2', wrap))
			.and(typeTag('word3', wrap))

			.and(closeTag('word2', wrap))
			.and(closeTag('word1', wrap))
			.and(closeTag('word3', wrap))
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

			.and(verifyTextExt)
			.and(testBasicTagFunctionality(wrap))
			.captureEntirePageScreenshot(__dirname + '/' + exampleId + ' (' + (new Date().toUTCString().replace(/:/g, '.')) + ').png')
			;
	};
};

browser.on('command', log);
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
		echo('ALL DONE');
	})
;

