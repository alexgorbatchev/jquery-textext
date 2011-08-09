(function($)
{
	function TextExtPrompt()
	{
	};

	$.fn.textext.TextExtPrompt = TextExtPrompt;
	$.fn.textext.addPlugin('prompt', TextExtPrompt);

	var p = TextExtPrompt.prototype,

		CSS_HIDE_PROMPT = 'text-hide-prompt',

		DEFAULT_OPTS = {
			prompt : 'Awaiting input...',

			html : {
				prompt : '<div class="text-prompt"/>'
			}
		}
		;

	p.init = function(parent)
	{
		var self = this,
			opts
			;

		self.baseInit(parent, DEFAULT_OPTS);
		
		opts = self.opts();

		self.core().getWrapContainer().append(opts.html.prompt);
		self.setPrompt(opts.prompt);
		
		self.on({
			blur  : self.onBlur,
			focus : self.onFocus
		});

		self._timeoutId = 0;
	};

	//--------------------------------------------------------------------------------
	// Event handlers
	
	/**
	 * Shows the prompt text if there's no value in the input.
	 * @author agorbatchev
	 * @date 2011/08/08
	 */
	p.onBlur = function(e)
	{
		var self = this;

		clearTimeout(self._timeoutId);

		if(self.input().val() == '')
			self._timeoutId = setTimeout(function()
			{
				self.getPrompt().removeClass(CSS_HIDE_PROMPT);
			},
			100);
	};

	/**
	 * Hides the prompt text when input is active.
	 * @author agorbatchev
	 * @date 2011/08/08
	 */
	p.onFocus = function(e)
	{
		var self = this;

		clearTimeout(self._timeoutId);
		self.getPrompt().addClass(CSS_HIDE_PROMPT);
	};
	
	//--------------------------------------------------------------------------------
	// Core functionality

	p.setPrompt = function(str)
	{
		this.getPrompt().text(str);
	};

	/**
	 * Returns prompt HTML element.
	 * @author agorbatchev
	 * @date 2011/08/08
	 */
	p.getPrompt = function()
	{
		return this.core().getWrapContainer().find('.text-prompt');
	};
})(jQuery);
