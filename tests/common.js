var soda = require('soda');

var prefix   = 'css=.text-core > .text-wrap > ',
	focus    = prefix + '.text-focus',
	textarea = prefix + 'textarea',
	dropdown = prefix + '.text-dropdown',
	prompt   = prefix + '.text-prompt'
	;

var DOWN  = 40,
	UP    = 38,
	ESC   = 27,
	ENTER = 13
	;

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
	browser.assertElementPresent(textarea);
};

function keyPress(charCode)
{
	return function(browser)
	{
		browser
			.keyDown(textarea, '\\' + charCode)
			.keyUp(textarea, '\\' + charCode)
			;
	};
};

function backspace(browser)
{
	browser.and(keyPress(8));
};
	
function tagXPath(value)
{
	return '//div[contains(@class, "text-core")]//div[contains(@class, "text-tags")]//span[text()="' + value + '"]/../..';
};

function suggestionsXPath(selected, index)
{
	index    = index != null ? '[' + (index + 1) + ']' : '';
	selected = selected == true ? '[contains(@class, "text-selected")]' : '';

	return '//div[contains(@class, "text-core")]//div[contains(@class, "text-dropdown")]//div[contains(@class, "text-suggestion")]' + index + selected;
};

function assertSuggestionItem(test)
{
	return function(browser) { browser.assertVisible(suggestionsXPath() + '//span[text()="Basic"]') };
};

function assertOutput(value)
{
	return function(browser) { browser.assertElementPresent('//pre[@id="output"][contains(text(), \'' + value + '\')]') };
};

function assertNotOutput(value)
{
	return function(browser) { browser.assertElementNotPresent('//pre[@id="output"][contains(text(), \'' + value + '\')]') };
};

function assertTagPresent(value)
{
	return function(browser) { browser.assertElementPresent(tagXPath(value)) };
};

function assertTagNotPresent(value)
{
	return function(browser) { browser.assertElementNotPresent(tagXPath(value)) };
};

function enterKey(browser)
{
	browser.and(keyPress(13));
};

function typeTag(value)
{
	return function(browser)
	{
		browser
			.type(textarea, '')
			.typeKeys(textarea, value)
			.and(enterKey)
			;
	};
};

function clearInput(browser)
{
	browser
		.and(keyPress(27))
		.type(textarea, '')
		;
};

function focusInput(browser)
{
	browser.fireEvent(textarea, 'focus');
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
		// browser.captureEntirePageScreenshot(__dirname + '/' + name + ' (' + (new Date().toUTCString().replace(/:/g, '.')) + ').png');
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

function testAjaxFunctionality()
{
	return function(browser)
	{
		browser
			.and(focusInput)
			.typeKeys(textarea, 'ba')
			.waitForVisible(dropdown)
			.and(assertSuggestionItem('Basic'))
			;
	}
};

function testArrowFunctionality()
{
	var arrow = prefix + '.text-arrow';

	return function(browser)
	{
		browser
			// open/close test
			.click(arrow)
			.waitForVisible(dropdown)
			.click(arrow)
			.waitForNotVisible(dropdown)

			// open and click on item
			.click(arrow)
			.waitForVisible(dropdown)
			.click(suggestionsXPath(false, 0))
			.waitForNotVisible(dropdown)
			.and(assertOutput('Basic'))
			.assertValue(textarea, 'Basic')
			.assertNotVisible(prompt)
			;
	};
};

function testFilterFunctionality()
{
	return function(browser)
	{
		browser
			.and(focusInput)

			.and(typeTag('hello'))
			.and(assertTagNotPresent('hello'))
			.and(assertNotOutput('hello'))

			.and(typeTag('world'))
			.and(assertTagNotPresent('world'))
			.and(assertNotOutput('world'))
			;
	};
};

function testTagFunctionality(opts)
{
	opts = opts || {};

	var labelWrap = opts.label,
		objectWrap = opts.object
		;

	function output()
	{
		var list = Array.prototype.slice.apply(arguments);

		if(objectWrap)
			for(var i = 0; i < list.length; i++)
				list[i] = objectWrap(list[i]);

		var match = JSON.stringify(list).replace(/^\[|\]$/g, '');

		return assertOutput(match);
	};

	return function(browser)
	{
		browser
			.and(focusInput)

			.and(typeAndValidateTag('hello', labelWrap))
			.and(output('hello'))

			.and(typeAndValidateTag('world', labelWrap))
			.and(output('hello','world'))
			
			.and(typeAndValidateTag('word1', labelWrap))
			.and(output('hello','world','word1'))
			
			.and(typeAndValidateTag('word2', labelWrap))
			.and(output('hello','world','word1','word2'))
			
			.and(typeAndValidateTag('word3', labelWrap))
			.and(output('hello','world','word1','word2','word3'))

			.and(closeTag('word2', labelWrap))
			.and(output('hello','world','word1','word3'))
			
			.and(closeTag('word1', labelWrap))
			.and(output('hello','world','word3'))
			
			.and(closeTag('word3', labelWrap))
			.and(output('hello','world'))

			// backspace
			.and(backspace)
			.and(assertTagNotPresent('world'))
			;
	};
};

function testPromptFunctionality(secondary)
{
	return function(browser)
	{
		browser
			.assertVisible(prompt)
			.and(focusInput)
			.and(secondary)
			.assertNotVisible(prompt)
			;
	};
};

function testAutocompleteFunctionality(finalAssert)
{
	finalAssert = finalAssert || function(browser)
	{
		browser
			.assertValue(textarea, 'OCAML')
			.and(assertOutput('OCAML'))
			;
	};
 
	return function(browser)
	{
		browser
			.click(textarea)
			.and(clearInput)
			
			// activate the dropdown
			.and(keyPress(DOWN))
			.assertVisible(dropdown)
			.assertVisible(suggestionsXPath(true, 0))

			// go to the second item
			.and(keyPress(DOWN))
			.assertElementNotPresent(suggestionsXPath(true, 0))
			.assertVisible(suggestionsXPath(true, 1))

			// go to the third item
			.and(keyPress(DOWN))
			.assertElementNotPresent(suggestionsXPath(true, 1))
			.assertVisible(suggestionsXPath(true, 2))

			// go back up to the second item
			.and(keyPress(UP))
			.assertElementNotPresent(suggestionsXPath(true, 2))
			.assertVisible(suggestionsXPath(true, 1))

			// go back up to the first item
			.and(keyPress(UP))
			.assertElementNotPresent(suggestionsXPath(true, 1))
			.assertVisible(suggestionsXPath(true, 0))

			// test the mouse click
			.click(suggestionsXPath(true, 0))
			.waitForNotVisible(dropdown)
			.assertValue(textarea, 'Basic')
			.and(assertOutput('Basic'))

			.and(clearInput)
			.typeKeys(textarea, 'oca')
			.waitForVisible(dropdown)
			.assertVisible(suggestionsXPath(true, 0))
			.and(enterKey)
			.assertNotVisible(dropdown)

			.and(finalAssert)
			;
	};
};

function testPlainInputFunctionality()
{
	return function(browser)
	{
		browser
			.typeKeys(textarea, 'Hello world')
			// for some reason without the enter key last letter doesn't trigger events... 
			// pressing the enter key puts the last letter through... odd??
			.and(enterKey)
			.and(assertOutput('"Hello world"'))
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
	log                           : log,
	echo                          : echo,
	clearInput                    : clearInput,
	focusInput                    : focusInput,
	backspace                     : backspace,
	keyPress                      : keyPress,
	verifyTextExt                 : verifyTextExt,
	tagXPath                      : tagXPath,
	suggestionsXPath              : suggestionsXPath,
	assertTagPresent              : assertTagPresent,
	assertTagNotPresent           : assertTagNotPresent,
	assertOutput                  : assertOutput,
	assertSuggestionItem          : assertSuggestionItem,
	typeTag                       : typeTag,
	typeAndValidateTag            : typeAndValidateTag,
	enterKey                      : enterKey,
	closeTag                      : closeTag,
	screenshot                    : screenshot,
	createBrowser                 : createBrowser,
	runModule                     : runModule,
	testFilterFunctionality       : testFilterFunctionality,
	testTagFunctionality          : testTagFunctionality,
	testPromptFunctionality       : testPromptFunctionality,
	testAutocompleteFunctionality : testAutocompleteFunctionality,
	testPlainInputFunctionality   : testPlainInputFunctionality,
	testAjaxFunctionality         : testAjaxFunctionality,
	testArrowFunctionality        : testArrowFunctionality,

	css : {
		focus    : focus,
		textarea : textarea,
		dropdown : dropdown
	}
};

