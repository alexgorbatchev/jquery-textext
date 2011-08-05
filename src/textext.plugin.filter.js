(function($)
{
	function TextExtFilter()
	{
	};

	$.fn.textext.TextExtFilter = TextExtFilter;
	$.fn.textext.addPlugin('filter', TextExtFilter);

	var p = TextExtFilter.prototype,
		DEFAULT_OPTS = {
			filterEnabled : true,
			filterItems   : null
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

		self._suggestions = null;
	};

	//--------------------------------------------------------------------------------
	// Core functionality

	/**
	 * Handles `isTagAllowed` event dispatched by the Tags plugin.
	 * @author agorbatchev
	 * @date 2011/08/04
	 */
	p.onIsTagAllowed = function(e, data)
	{
		var self = this,
			opts = self.opts(),
			list = opts.filterItems || self.suggestions() || [],
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
		this.suggestions(data.result);
	};

	p.suggestions = function(value)
	{
		var self = this;
		return self._suggestion = value || self._suggestion;
	};
})(jQuery);
