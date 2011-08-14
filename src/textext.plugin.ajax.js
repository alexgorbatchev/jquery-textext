(function($)
{
	function TextExtAjax()
	{
	};

	$.fn.textext.TextExtAjax = TextExtAjax;
	$.fn.textext.addPlugin('ajax', TextExtAjax);

	var p = TextExtAjax.prototype,
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

	function dataCallback(query)
	{
		return { q : query };
	};

	p.init = function(parent)
	{
		var self = this;

		self.baseInit(parent, DEFAULT_OPTS);

		self.on({
			getSuggestions : self.onGetSuggestions
		});

		self._typeTimeoutId    = 0;
		self._loadingTimeoutId = 0;
		self._suggestions = null;
	};

	p.load = function(query)
	{
		var self         = this,
			dataCallback = self.opts('ajax.dataCallback') || function(query) { return { q : query } },
			opts
			;

		opts = $.extend(true,
			{
				data    : dataCallback(query),
				success : function(data) { self.onComplete(data, query) },
				error   : function(jqXHR, message) { console.error(message) }
			}, 
			self.opts('ajax')
		);

		$.ajax(opts);
	};

	p.filterSuggestions = function(suggestions, query)
	{
		var result = [],
			i, item
			;

		for(i = 0; i < suggestions.length; i++)
		{
			item = suggestions[i];
			if(this.itemContains(item, query))
				result.push(item);
		}

		return result;
	};

	p.onComplete = function(data, query)
	{
		var self   = this,
			result = data
			;
		
		if(self.opts('ajax.cacheResults') == true)
		{
			self._suggestions = data;
			result = self.filterSuggestions(data, query);
		}

		self.setSuggestions(result);
	};

	p.setSuggestions = function(suggestions, showHideDropdown)
	{
		this.trigger('setSuggestions', { result : suggestions, showHideDropdown : showHideDropdown != false });
	};

	p.showLoading = function()
	{
		var self = this;

		clearTimeout(self._loadingTimeoutId);
		self._loadingTimeoutId = setTimeout(
			function()
			{
				self.trigger('showDropdown', function(autocomplete)
				{
					autocomplete.clearItems();
					autocomplete.addDropdownItem(self.opts('ajax.loadingMessage'));
				});
			},
			self.opts('ajax.loadingDelay')
		);
	};

	p.onGetSuggestions = function(e, data)
	{
		var self        = this,
			suggestions = self._suggestions,
			query       = data.query
			;

		if(suggestions && self.opts('ajax.cacheResults') == true)
			return self.onComplete(suggestions, query);
		
		clearTimeout(self._typeTimeoutId);
		self._typeTimeoutId = setTimeout(
			function()
			{
				self.showLoading();
				self.load(query);
			},
			self.opts('ajax.typeDelay') * 1000
		);
	};
})(jQuery);
