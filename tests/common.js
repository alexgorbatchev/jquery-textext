var soda = require('soda');

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
	browser.assertElementPresent('css=.text-core > .text-wrap > #textarea');
};

function tagXPath(value)
{
	return '//div[@class="text-core"]//div[@class="text-tags"]//span[text()="' + value + '"]/../..';
};

function suggestionsXPath(selected, index)
{
	index    = index != null ? '[' + (index + 1) + ']' : ''
	selected = selected == true ? '[contains(@class, "text-selected")]' : '';

	return '//div[@class="text-core"]//div[@class="text-dropdown"]//div[contains(@class, "text-suggestion")]' + index + selected;
}

function assertTagPresent(value)
{
	return function(browser) { browser.assertElementPresent(tagXPath(value)) };
};

function assertTagNotPresent(value)
{
	return function(browser) { browser.assertElementNotPresent(tagXPath(value)) };
};

function typeTag(value)
{
	return function(browser)
	{
		browser
			.type('css=#textarea', value)
			.keyDown('css=#textarea', '\\13')
			;
	};
};

function defaultWrap(value)
{
	return value;
};

function typeAndValidateTag(value, wrap)
{
	wrap = wrap || defaultWrap;
	return function(browser)
	{
		browser
			.and(typeTag(value))
			.and(assertTagPresent(wrap(value)))
			;
	};
};

function closeTag(value, wrap)
{
	wrap = wrap || defaultWrap;
	return function(browser)
	{
		browser
			.click(tagXPath(wrap(value)) + '//a[@class="text-remove"]')
			.and(assertTagNotPresent(wrap(value)))
			;
	};
};

function screenshot(name)
{
	return function(browser)
	{
		browser.captureEntirePageScreenshot(__dirname + '/' + name + ' (' + (new Date().toUTCString().replace(/:/g, '.')) + ').png');
	};
};

function createBrowser()
{
	return soda.createClient({
		host    : 'localhost',
		port    : 4444,
		url     : 'http://localhost:4000',
		browser : 'firefox'
	});
};

function testFilterFunctionality()
{
	return function(browser)
	{
		browser
			.click('css=.text-wrap')

			.and(typeTag('hello'))
			.and(assertTagNotPresent('hello'))
			.and(typeTag('world'))
			.and(assertTagNotPresent('world'))

			.and(typeAndValidateTag('PHP'))
			.and(typeAndValidateTag('Ruby'))
			.and(typeAndValidateTag('Go'))
			;
	};
};

function testTagFunctionality(wrap)
{
	return function(browser)
	{
		browser
			.click('css=.text-wrap')

			.and(typeAndValidateTag('hello', wrap))
			.and(typeAndValidateTag('world', wrap))
			.and(typeAndValidateTag('word1', wrap))
			.and(typeAndValidateTag('word2', wrap))
			.and(typeAndValidateTag('word3', wrap))

			.and(closeTag('word2', wrap))
			.and(closeTag('word1', wrap))
			.and(closeTag('word3', wrap))

			// backspace
			.keyDown('css=#textarea', '\\8')
			.and(assertTagNotPresent('world'))
			;
	};
};

function runModule(run)
{
	var browser = createBrowser();

	browser.on('command', log);

	browser.chain.session()
		.windowMaximize()
		.and(run)
		.testComplete()
		.end(function(err)
		{
			if (err) throw err;
			echo('ALL DONE');
		})
	;
};

module.exports = {
	log                     : log,
	echo                    : echo,
	verifyTextExt           : verifyTextExt,
	tagXPath                : tagXPath,
	suggestionsXPath        : suggestionsXPath,
	assertTagPresent        : assertTagPresent,
	assertTagNotPresent     : assertTagNotPresent,
	typeTag                 : typeTag,
	typeAndValidateTag      : typeAndValidateTag,
	closeTag                : closeTag,
	screenshot              : screenshot,
	createBrowser           : createBrowser,
	runModule               : runModule,
	testFilterFunctionality : testFilterFunctionality,
	testTagFunctionality    : testTagFunctionality
};

