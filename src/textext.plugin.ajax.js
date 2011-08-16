(function($)
{
	function TextExtAjax()
	{
	};

	$.fn.textext.TextExtAjax = TextExtAjax;
	$.fn.textext.addPlugin('ajax', TextExtAjax);

	var p = TextExtAjax.prototype,

		OPT_DATA_CALLBACK   = 'ajax.data.callback',
		OPT_CACHE_RESULTS   = 'ajax.cache.results',
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
