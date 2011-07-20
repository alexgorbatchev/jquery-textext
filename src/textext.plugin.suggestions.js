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
		var self = this,
			opts = {
				getSuggestions : function(val, callback) { self.getSuggestions(val, callback) }
			}
			;

		self.baseInit(parent, $.extend(true, opts, DEFAULT_OPTS));

		var input = self.getInput(),
			opts  = self.getOpts()
			;
	};

	//--------------------------------------------------------------------------------
	// Event handlers
	

	//--------------------------------------------------------------------------------
	// Core functionality

	p.getSuggestions = function(val, callback)
	{
		var self        = this,
			suggestions = self.getOpts().suggestions,
			result      = []
			;

		suggestions.sort();
		val = val.toLowerCase();

		if(val == '')
			return callback(suggestions);

		for(var i = 0; i < suggestions.length; i++)
			if(suggestions[i].toLowerCase().indexOf(val) == 0)
				result.push(suggestions[i]);

		callback(result.length == 0 ? null : result);
	};
})(jQuery);
