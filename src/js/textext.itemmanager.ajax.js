/**
 * jQuery TextExt Plugin
 * http://textextjs.com
 *
 * @version 1.3.0
 * @copyright Copyright (C) 2011 Alex Gorbatchev. All rights reserved.
 * @license MIT License
 */
(function($, undefined)
{
	function ItemManagerAjax()
	{
	};

	$.fn.textext.ItemManagerAjax = ItemManagerAjax;
	$.fn.textext.addItemManager('ajax', ItemManagerAjax);

	var p = ItemManagerAjax.prototype,

		CSS_LOADING = 'text-loading',

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
		 * @id ItemManagerAjax.options
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
		 *     'dataCallback' : function(filter)
		 *     {
		 *         return { 'search' : filter };
		 *     } 
		 *
		 * @name ajax.data.callback
		 * @default null
		 * @author agorbatchev
		 * @date 2011/08/16
		 * @id ItemManagerAjax.options.data.callback
		 */
		OPT_DATA_CALLBACK = 'ajax.data.callback',
		
		/**
		 * By default, the server end point is constantly being reloaded whenever user changes the value
		 * in the text input. If you'd rather have the client do result filtering, you can return all
		 * possible results from the server and cache them on the client by setting this option to `true`.
		 *
		 * In such a case, only one call to the server will be made and filtering will be performed on
		 * the client side using `ItemManagerAjax` attached to the core.
		 *
		 * @name ajax.data.results
		 * @default false
		 * @author agorbatchev
		 * @date 2011/08/16
		 * @id ItemManagerAjax.options.cache.results
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
		 * @id ItemManagerAjax.options.loading.delay
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
		 * @id ItemManagerAjax.options.loading.message
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
		 * @id ItemManagerAjax.options.type.delay
		 */
		OPT_TYPE_DELAY = 'ajax.type.delay',

		TIMER_LOADING = 'loading',

		DEFAULT_OPTS = {
			ajax : {
				typeDelay    : 0.5,
				loadingDelay : 0.5,
				cacheResults : false,
				dataCallback : null
			}
		}
		;

	/**
	 * Initialization method called by the core during plugin instantiation.
	 *
	 * @signature ItemManagerAjax.init(core)
	 *
	 * @param core {TextExt} Instance of the TextExt core class.
	 *
	 * @author agorbatchev
	 * @date 2011/08/17
	 * @id ItemManagerAjax.init
	 */
	p.init = function(core)
	{
		this.baseInit(core, DEFAULT_OPTS);
	};

	p.getSuggestions = function(filter, callback)
	{
		var self = this;

		self.startTimer(
			'ajax',
			self.opts(OPT_TYPE_DELAY),
			function()
			{
				self.beginLoading();
				self.load(filter, callback);
			}
		);
	};

	p.load = function(filter, callback)
	{
		var self         = this,
			dataCallback = self.opts(OPT_DATA_CALLBACK),
			opts
			;

		if(self._cached && self.opts(OPT_CACHE_RESULTS))
		{
			self.stopLoading();
			return self.filter(self.suggestions, filter, callback);
		}

		opts = $.extend(true,
			{
				data    : dataCallback ? dataCallback(filter) : self.getData(filter),
				success : function(data) { self.onSuccess(data, filter, callback); },
				error   : function(jqXHR, message) { self.onError(jqXHR, message, filter, callback); }
			}, 
			self.opts('ajax')
		);

		$.ajax(opts);
	};

	p.getData = function(filter)
	{
		return { q : filter };
	};

	p.onSuccess = function(data, filter, callback)
	{
		var self = this;

		self.stopLoading();

		if(self.opts(OPT_CACHE_RESULTS))
		{
			self.suggestions = data;
			self._cached     = true;
		}

		self.filter(data, filter, callback);
	};

	p.onError = function(jqXHR, message, filter, callback)
	{
		this.stopLoading();
		callback(new Error(message));
	};
	
	/**
	 * If show loading message timer was started, calling this function disables it,
	 * otherwise nothing else happens.
	 *
	 * @signature ItemManagerAjax.stopLoading()
	 *
	 * @author agorbatchev
	 * @date 2011/08/16
	 * @id ItemManagerAjax.stopLoading
	 */
	p.stopLoading = function()
	{
		this.stopTimer(TIMER_LOADING);
		this.input().removeClass(CSS_LOADING);
	};

	/**
	 * Shows message specified in `ajax.loading.message` if loading data takes more than
	 * number of seconds specified in `ajax.loading.delay`.
	 *
	 * @signature ItemManagerAjax.beginLoading()
	 *
	 * @author agorbatchev
	 * @date 2011/08/15
	 * @id ItemManagerAjax.beginLoading
	 */
	p.beginLoading = function()
	{
		var self = this;

		self.stopLoading();
		self.startTimer(
			TIMER_LOADING,
			self.opts(OPT_LOADING_DELAY),
			function()
			{
				self.input().addClass(CSS_LOADING);
			}
		);
	};
})(jQuery);

