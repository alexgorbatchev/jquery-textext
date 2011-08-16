(function($)
{
	/**
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
		 * ### Options
		 *
		 * AJAX plugin options are grouped under `ajax` when passed to the `$().textext()` function. Be
		 * mindful that the whole `ajax` object is also passed to jQuery `$.ajax` call which means that
		 * you can change all jQuery options as well. Please refer to the jQuery documentation on how
		 * to set url and all other parameters.
		 * 
		 * @author agorbatchev
		 * @date 2011/08/16
		 * @id TextExtAjax.options
		 */

		/**
		 * #### ajax.data.callback
		 *
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
		 * @author agorbatchev
		 * @date 2011/08/16
		 * @id TextExtAjax.options.data.callback
		 */
		OPT_DATA_CALLBACK   = 'ajax.data.callback',
		
		/**
		 * #### ajax.cache.results
		 *
		 * By default, the server end point is constantly being reloaded whenever user changes the value
		 * in the text input. If you'd rather have the client do result filtering, you can return all
		 * possible results from the server and cache them on the client by setting this option to `true`.
		 *
		 * In such a case, only one call to the server will be made and filtering will be performed on
		 * the client side using `ItemManager` attached to the core.
		 *
		 * @author agorbatchev
		 * @date 2011/08/16
		 * @id TextExtAjax.options.cache.results
		 */
		OPT_CACHE_RESULTS   = 'ajax.cache.results',
		
		/**
		 * #### ajax.loading.delay
		 *
		 * The loading message delay is set in seconds and will specify how long it would take before
		 * user sees the message. If you don't want user to ever see this message, set the option value
		 * to `Number.MAX_VALUE`.
		 *
		 * @author agorbatchev
		 * @date 2011/08/16
		 * @id TextExtAjax.options.loading.delay
		 */
		OPT_LOADING_DELAY   = 'ajax.loading.delay',
		OPT_LOADING_MESSAGE = 'ajax.loading.message',
		OPT_TYPE_DELAY      = 'ajax.type.delay',

		DEFAULT_OPTS = {
			ajax : {
				typeDelay : 0.5,
				loadingMessage : 'Loading...',
				loadingDelay : 0.5,
				cacheResults : false,
				dataCallback : null
			}
		}
		;

	p.init = function(parent)
	{
		var self = this;

		self.baseInit(parent, DEFAULT_OPTS);

		self.on({
			getSuggestions : self.onGetSuggestions
		});

		self._typeTimeoutId    = 0;
		self._loadingTimeoutId = 0;
		self._suggestions      = null;
	};

	/**
	 * Performas an async AJAX with specified options.
	 *
	 * @param query {String} Value that user has typed into the text area which is
	 * presumably the query.
	 *
	 * @author agorbatchev
	 * @date 2011/08/14
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
	 * @author agorbatchev
	 * @date 2011/08/14
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

		self.trigger('setSuggestions', { result : result });
	};

	/**
	 * If show loading message timer was started, calling this function disables it,
	 * otherwise nothing else happens.
	 *
	 * @author agorbatchev
	 * @date 2011/08/16
	 */
	p.dontShowLoading = function()
	{
		clearTimeout(this._loadingTimeoutId);
	};

	/**
	 * Shows message specified in `ajaxLoadingMessage` if loading data takes more than
	 * number of seconds specified in `ajaxLoadingDelay`.
	 *
	 * @author agorbatchev
	 * @date 2011/08/15
	 */
	p.showLoading = function()
	{
		var self = this;

		self.dontShowLoading();
		self._loadingTimeoutId = setTimeout(
			function()
			{
				self.trigger('showDropdown', function(autocomplete)
				{
					autocomplete.clearItems();
					var node = autocomplete.addDropdownItem(self.opts(OPT_LOADING_MESSAGE));
					node.addClass('text-loading');
				});
			},
			self.opts(OPT_LOADING_DELAY) * 1000
		);
	};

	/**
	 * Reacts to the `getSuggestions` event and begin loading suggestions. If
	 * `ajaxCacheResults` is specified, all calls after the first one will use
	 * cached data and filter it with the `core.itemManager.filter()`.
	 *
	 * @author agorbatchev
	 * @date 2011/08/15
	 */
	p.onGetSuggestions = function(e, data)
	{
		var self        = this,
			suggestions = self._suggestions,
			query       = data.query
			;

		if(suggestions && self.opts(OPT_CACHE_RESULTS) == true)
			return self.onComplete(suggestions, query);
		
		clearTimeout(self._typeTimeoutId);
		self._typeTimeoutId = setTimeout(
			function()
			{
				self.showLoading();
				self.load(query);
			},
			self.opts(OPT_TYPE_DELAY) * 1000
		);
	};
})(jQuery);
