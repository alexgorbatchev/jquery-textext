(function($)
{
	function TextExtSuggestions()
	{
	};

	$.fn.textext.TextExtSuggestions = TextExtSuggestions;
	$.fn.textext.addPlugin('suggestions', TextExtSuggestions);

	var p = TextExtSuggestions.prototype,
		DEFAULT_OPTS = {
			suggestions : []
		}
		;

	p.init = function(parent)
	{
		var self = this;

		self.baseInit(parent, DEFAULT_OPTS);

		self.on({
			getSuggestions : self.onGetSuggestions,
			postInit       : self.onPostInit
		});
	};

	p.setSuggestions = function(suggestions, showHideDropdown)
	{
		this.trigger('setSuggestions', { result : suggestions, showHideDropdown : showHideDropdown != false });
	};

	p.onPostInit = function(e)
	{
		var self = this;
		self.setSuggestions(self.opts().suggestions, false);
	};

	p.onGetSuggestions = function(e, data)
	{
		var self        = this,
			suggestions = self.opts().suggestions,
			result      = [],
			query       = data.query.toLowerCase(),
			item
			;

		suggestions.sort();

		if(query == '')
			result = suggestions.slice();
		else
			for(var i = 0; i < suggestions.length, item = suggestions[i]; i++)
				if(item.toLowerCase().indexOf(query) == 0)
					result.push(item);

		self.setSuggestions(result);
	};
})(jQuery);
