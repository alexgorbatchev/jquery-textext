(function($)
{
	function TextExtFilter()
	{
	};

	$.fn.textext.TextExtFilter = TextExtFilter;
	$.fn.textext.addPlugin('filter', TextExtFilter);

	var p = TextExtFilter.prototype,
		DEFAULT_OPTS = {
			filterEnabled          : true,
			useSuggestionsToFilter : false,
			filterItems            : []
		}
		;

	p.init = function(parent)
	{
		var self = this;
		self.baseInit(parent, DEFAULT_OPTS);

		self.on({
			isTagAllowed   : self.onIsTagAllowed,
			setSuggestions : self.onSetSuggestions
		});
	};

	//--------------------------------------------------------------------------------
	// Core functionality

	p.onIsTagAllowed = function(e, data)
	{
		var self = this,
			opts = self.getOpts(),
			list = opts.filterItems || [],
			i
			;

		if(!opts.filterEnabled)
			return;

		data.result = false;

		for(i = 0; i < list.length; i++)
			if(self.compareItems(data.tag, list[i]))
				return data.result = true;
	};

	p.onSetSuggestions = function(e, data)
	{
		var opts = this.getOpts();

		if(opts.useSuggestionsToFilter)
			opts.filterItems = data.result;
	};
})(jQuery);
