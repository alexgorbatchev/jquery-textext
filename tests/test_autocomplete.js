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

var DOWN = '\\40';

function testBasicAutocompleteFunctionality(wrap)
{
	return function(browser)
	{
		var dropdown = 'css=.text-core > .text-wrap > .text-dropdown';

		browser
			.click('css=.text-wrap')
			.keyDown('css=#textarea', DOWN)
			.assertVisible(dropdown)
			;
	};
};

function testAutocomplete(exampleId, wrap)
{
	wrap = wrap || function(v) { return v };

	return function(browser)
	{
		browser
			.open('/')
			.clickAndWait('css=#example-doc-plugins-autocomplete-examples-' + exampleId)

			.and(common.verifyTextExt)
			.and(testBasicAutocompleteFunctionality(wrap))
			.and(common.screenshot('autocomplete-' + exampleId))
			;
	};
};

browser.on('command', common.log);
browser.chain.session()

	.windowMaximize()

	.and(testAutocomplete('01-dropdown'))

	.testComplete()
	
	.end(function(err)
	{
		if (err) throw err;
		common.echo('ALL DONE');
	})
;

