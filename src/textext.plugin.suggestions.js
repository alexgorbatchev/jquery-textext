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

		var input = self.getInput(),
			opts  = self.getOpts()
			;

		self.on({
			getSuggestions : self.onGetSuggestions
		});
	};

	//--------------------------------------------------------------------------------
	// Event handlers
	

	//--------------------------------------------------------------------------------
	// Core functionality

	p.onGetSuggestions = function(e, data)
	{
		var self        = this,
			suggestions = self.getOpts().suggestions,
			result      = [],
			query       = data.query,
			item
			;

		suggestions.sort();
		query = query.toLowerCase();

		if(query == '')
			result = suggestions.slice();
		else
			for(var i = 0; i < suggestions.length, item = suggestions[i]; i++)
				if(item.toLowerCase().indexOf(query) == 0)
					result.push(item);

		self.trigger('setSuggestions', { result : result.length == 0 ? null : result });
	};
})(jQuery);
