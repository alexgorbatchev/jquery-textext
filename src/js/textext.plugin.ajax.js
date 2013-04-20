/**
 * jQuery TextExt Plugin
 * http://textextjs.com
 *
 * @version 1.3.1
 * @copyright Copyright (C) 2011 Alex Gorbatchev. All rights reserved.
 * @license MIT License
 */
(function($)
{
	/**
	 * AJAX plugin is very useful if you want to load list of items from a data point and pass it
	 * to the Autocomplete or Filter plugins.
	 *
	 * Because it meant to be as a helper method for either Autocomplete or Filter plugin, without
	 * either of these two present AJAX plugin won't do anything.
	 *
	 * @author agorbatchev
	 * @date 2011/08/16
	 * @id TextExtAjax
	 */
	function TextExtAjax() {};

	$.fn.textext.TextExtAjax = TextExtAjax;
	$.fn.textext.addPlugin('ajax', TextExtAjax);

	var p = TextExtAjax.prototype,

		/**
		 * AJAX plugin options are grouped under `ajax` when passed to the `$().textext()` function. Be
		 * mindful that the whole `ajax` object is also passed to jQuery `$.ajax` call which means that
		 * you can change all jQuery options as well. Please refer to the jQuery documentation on how
		 * to set url and all other parameters. For example:
		 *
		 *     $('textarea').textext({
		 *         plugins: 'ajax',
		 *         ajax: {
		 *             url: 'http://...'
		 *         }
		 *     })
		 *
		 * **Important**: Because it's necessary to pass options to `jQuery.ajax()` in a single object,
		 * all jQuery related AJAX options like `url`, `dataType`, etc **must** be within the `ajax` object.
		 * This is the exception to general rule that TextExt options can be specified in dot or camel case 
		 * notation.
		 * 
		 * @author agorbatchev
		 * @date 2011/08/16
		 * @id TextExtAjax.options
		 */

		/**
		 * By default, when user starts typing into the text input, AJAX plugin will start making requests
		 * to the `url` that you have specified and will pass whatever user has typed so far as a parameter
		 * named `q`, eg `?q=foo`.
		 *
		 * If you wish to change this behaviour, you can pass a function as a value for this option which
		 * takes one argument (the user input) and should return a key/value object that will be converted
		 * to the request parameters. For example:
		 *
		 *     'dataCallback' : function(query)
		 *     {
		 *         return { 'search' : query };
		 *     } 
		 *
		 * @name ajax.data.callback
		 * @default null
		 * @author agorbatchev
		 * @date 2011/08/16
		 * @id TextExtAjax.options.data.callback
		 */
		OPT_DATA_CALLBACK = 'ajax.data.callback',
		
		/**
		 * By default, the server end point is constantly being reloaded whenever user changes the value
		 * in the text input. If you'd rather have the client do result filtering, you can return all
		 * possible results from the server and cache them on the client by setting this option to `true`.
		 *
		 * In such a case, only one call to the server will be made and filtering will be performed on
		 * the client side using `ItemManager` attached to the core.
		 *
		 * @name ajax.data.results
		 * @default false
		 * @author agorbatchev
		 * @date 2011/08/16
		 * @id TextExtAjax.options.cache.results
		 */
		OPT_CACHE_RESULTS = 'ajax.cache.results',
		
		/**
		 * The loading message delay is set in seconds and will specify how long it would take before
		 * user sees the message. If you don't want user to ever see this message, set the option value
		 * to `Number.MAX_VALUE`.
		 *
		 * @name ajax.loading.delay
		 * @default 0.5
		 * @author agorbatchev
		 * @date 2011/08/16
		 * @id TextExtAjax.options.loading.delay
		 */
		OPT_LOADING_DELAY = 'ajax.loading.delay',

		/**
		 * Whenever an AJAX request is made and the server takes more than the number of seconds specified
		 * in `ajax.loading.delay` to respond, the message specified in this option will appear in the drop
		 * down.
		 *
		 * @name ajax.loading.message
		 * @default "Loading..."
		 * @author agorbatchev
		 * @date 2011/08/17
		 * @id TextExtAjax.options.loading.message
		 */
		OPT_LOADING_MESSAGE = 'ajax.loading.message',

		/**
		 * When user is typing in or otherwise changing the value of the text input, it's undesirable to make
		 * an AJAX request for every keystroke. Instead it's more conservative to send a request every number
		 * of seconds while user is typing the value. This number of seconds is specified by the `ajax.type.delay`
		 * option.
		 *
		 * @name ajax.type.delay
		 * @default 0.5
		 * @author agorbatchev
		 * @date 2011/08/17
		 * @id TextExtAjax.options.type.delay
		 */
		OPT_TYPE_DELAY = 'ajax.type.delay',

		/**
		 * AJAX plugin dispatches or reacts to the following events.
		 *
		 * @author agorbatchev
		 * @date 2011/08/17
		 * @id TextExtAjax.events
		 */

		/**
		 * AJAX plugin reacts to the `getSuggestions` event dispatched by the Autocomplete plugin.
		 *
		 * @name getSuggestions
		 * @author agorbatchev
		 * @date 2011/08/17
		 * @id TextExtAjax.events.getSuggestions
		 */

		/**
		 * In the event of successful AJAX request, the AJAX coponent dispatches the `setSuggestions`
		 * event meant to be recieved by the Autocomplete plugin.
		 *
		 * @name setSuggestions
		 * @author agorbatchev
		 * @date 2011/08/17
		 * @id TextExtAjax.events.setSuggestions
		 */
		EVENT_SET_SUGGESTION = 'setSuggestions',

		/**
		 * AJAX plugin dispatches the `showDropdown` event which Autocomplete plugin is expecting.
		 * This is used to temporarily show the loading message if the AJAX request is taking longer
		 * than expected.
		 *
		 * @name showDropdown
		 * @author agorbatchev
		 * @date 2011/08/17
		 * @id TextExtAjax.events.showDropdown
		 */
		EVENT_SHOW_DROPDOWN = 'showDropdown',

		TIMER_LOADING = 'loading',

		DEFAULT_OPTS = {
			ajax : {
				typeDelay      : 0.5,
				loadingMessage : 'Loading...',
				loadingDelay   : 0.5,
				cacheResults   : false,
				dataCallback   : null
			}
		}
		;

	/**
	 * Initialization method called by the core during plugin instantiation.
	 *
	 * @signature TextExtAjax.init(core)
	 *
	 * @param core {TextExt} Instance of the TextExt core class.
	 *
	 * @author agorbatchev
	 * @date 2011/08/17
	 * @id TextExtAjax.init
	 */
	p.init = function(core)
	{
		var self = this;

		self.baseInit(core, DEFAULT_OPTS);

		self.on({
			getSuggestions : self.onGetSuggestions
		});

		self._suggestions = null;
	};

	/**
	 * Performas an async AJAX with specified options.
	 *
	 * @signature TextExtAjax.load(query)
	 *
	 * @param query {String} Value that user has typed into the text area which is
	 * presumably the query.
	 *
	 * @author agorbatchev
	 * @date 2011/08/14
	 * @id TextExtAjax.load
	 */
	p.load = function(query)
	{
		var self         = this,
			dataCallback = self.opts(OPT_DATA_CALLBACK) || function(query) { return { q : query } },
			opts
			;

		opts = $.extend(true,
			{
				data    : dataCallback(query),
				success : function(data) { self.onComplete(data, query) },
				error   : function(jqXHR, message) { console.error(message, query) }
			}, 
			self.opts('ajax')
		);

		$.ajax(opts);
	};

	/**
	 * Successful call AJAX handler. Takes the data that came back from AJAX and the
	 * original query that was used to make the call.
	 *
	 * @signature TextExtAjax.onComplete(data, query)
	 *
	 * @param data {Object} Data loaded from the server, should be an Array of strings
	 * by default or whatever data structure your custom `ItemManager` implements.
	 *
	 * @param query {String} Query string, ie whatever user has typed in.
	 *
	 * @author agorbatchev
	 * @date 2011/08/14
	 * @id TextExtAjax.onComplete
	 */
	p.onComplete = function(data, query)
	{
		var self   = this,
			result = data
			;
		
		self.dontShowLoading();

		// If results are expected to be cached, then we store the original
		// data set and return the filtered one based on the original query.
		// That means we do filtering on the client side, instead of the
		// server side.
		if(self.opts(OPT_CACHE_RESULTS) == true)
		{
			self._suggestions = data;
			result = self.itemManager().filter(data, query);
		}

		self.trigger(EVENT_SET_SUGGESTION, { result : result });
	};

	/**
	 * If show loading message timer was started, calling this function disables it,
	 * otherwise nothing else happens.
	 *
	 * @signature TextExtAjax.dontShowLoading()
	 *
	 * @author agorbatchev
	 * @date 2011/08/16
	 * @id TextExtAjax.dontShowLoading
	 */
	p.dontShowLoading = function()
	{
		this.stopTimer(TIMER_LOADING);
	};

	/**
	 * Shows message specified in `ajax.loading.message` if loading data takes more than
	 * number of seconds specified in `ajax.loading.delay`.
	 *
	 * @signature TextExtAjax.showLoading()
	 *
	 * @author agorbatchev
	 * @date 2011/08/15
	 * @id TextExtAjax.showLoading
	 */
	p.showLoading = function()
	{
		var self = this;

		self.dontShowLoading();
		self.startTimer(
			TIMER_LOADING,
			self.opts(OPT_LOADING_DELAY),
			function()
			{
				self.trigger(EVENT_SHOW_DROPDOWN, function(autocomplete)
				{
					autocomplete.clearItems();
					var node = autocomplete.addDropdownItem(self.opts(OPT_LOADING_MESSAGE));
					node.addClass('text-loading');
				});
			}
		);
	};

	/**
	 * Reacts to the `getSuggestions` event and begin loading suggestions. If
	 * `ajax.cache.results` is specified, all calls after the first one will use
	 * cached data and filter it with the `core.itemManager.filter()`.
	 *
	 * @signature TextExtAjax.onGetSuggestions(e, data)
	 *
	 * @param e {Object} jQuery event.
	 * @param data {Object} Data structure passed with the `getSuggestions` event
	 * which contains the user query, eg `{ query : "..." }`.
	 *
	 * @author agorbatchev
	 * @date 2011/08/15
	 * @id TextExtAjax.onGetSuggestions
	 */
	p.onGetSuggestions = function(e, data)
	{
		var self        = this,
			suggestions = self._suggestions,
			query       = (data || {}).query || ''
			;

		if(suggestions && self.opts(OPT_CACHE_RESULTS) === true)
			return self.onComplete(suggestions, query);
		
		self.startTimer(
			'ajax',
			self.opts(OPT_TYPE_DELAY),
			function()
			{
				self.showLoading();
				self.load(query);
			}
		);
	};
})(jQuery);
