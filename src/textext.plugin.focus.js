(function($)
{
	function TextExtFocus()
	{
	};

	$.fn.textext.TextExtFocus = TextExtFocus;
	$.fn.textext.addPlugin('focus', TextExtFocus);

	var p = TextExtFocus.prototype,
		DEFAULT_OPTS = {
			html : {
				focus : '<div class="text-focus"/>'
			}
		}
		;

	p.init = function(parent)
	{
		var self = this;

		self.baseInit(parent, DEFAULT_OPTS);
		self.core().getWrapContainer().append(self.opts('html.focus'));
		self.on({
			blur  : self.onBlur,
			focus : self.onFocus
		});

		self._timeoutId = 0;
	};

	//--------------------------------------------------------------------------------
	// Event handlers
	
	/**
	 * Hides the focus effect with a slight delay which allows for quick
	 * refocusing without focus effect blinking in and out.
	 * @author agorbatchev
	 * @date 2011/08/08
	 */
	p.onBlur = function(e)
	{
		var self = this;

		clearTimeout(self._timeoutId);

		self._timeoutId = setTimeout(function()
		{
			self.getFocus().hide();
		},
		100);
	};

	/**
	 * Shows the focus effect.
	 * @author agorbatchev
	 * @date 2011/08/08
	 */
	p.onFocus = function(e)
	{
		var self = this;

		clearTimeout(self._timeoutId);
		
		self.getFocus().show();
	};
	
	//--------------------------------------------------------------------------------
	// Core functionality

	/**
	 * Returns focus effect HTML element.
	 * @author agorbatchev
	 * @date 2011/08/08
	 */
	p.getFocus = function()
	{
		return this.core().getWrapContainer().find('.text-focus');
	};
})(jQuery);
