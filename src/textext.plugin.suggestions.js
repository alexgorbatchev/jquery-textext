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
		self.setSuggestions(self.opts('suggestions'), false);
	};

	p.onGetSuggestions = function(e, data)
	{
		var self        = this,
			suggestions = self.opts('suggestions'),
			;

		suggestions.sort();
		self.setSuggestions(self.itemManager().filterItems(suggestions, data.query));
	};
})(jQuery);
