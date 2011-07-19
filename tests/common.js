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

function screenshot(name)
{
	return function(browser)
	{
		browser.captureEntirePageScreenshot(__dirname + '/' + name + ' (' + (new Date().toUTCString().replace(/:/g, '.')) + ').png');
	};
};

module.exports = {
	log                 : log,
	echo                : echo,
	verifyTextExt       : verifyTextExt,
	tagXPath            : tagXPath,
	assertTagPresent    : assertTagPresent,
	assertTagNotPresent : assertTagNotPresent,
	typeTag             : typeTag,
	closeTag            : closeTag,
	screenshot          : screenshot
};

