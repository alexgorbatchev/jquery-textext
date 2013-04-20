/**
 * jQuery TextExt Plugin
 * http://textextjs.com
 *
 * @version 1.3.1
 * @copyright Copyright (C) 2011 Alex Gorbatchev. All rights reserved.
 * @license MIT License
 */
(function($)
{
	/**
	 * Focus plugin displays a visual effect whenever user sets focus
	 * into the text area.
	 *
	 * @author agorbatchev
	 * @date 2011/08/18
	 * @id TextExtFocus
	 */
	function TextExtFocus() {};

	$.fn.textext.TextExtFocus = TextExtFocus;
	$.fn.textext.addPlugin('focus', TextExtFocus);

	var p = TextExtFocus.prototype,
		/**
		 * Focus plugin only has one option and that is its HTML template. It could be 
		 * changed when passed to the `$().textext()` function. For example:
		 *
		 *     $('textarea').textext({
		 *         plugins: 'focus',
		 *         html: {
		 *             focus: "<span/>"
		 *         }
		 *     })
		 *
		 * @author agorbatchev
		 * @date 2011/08/18
		 * @id TextExtFocus.options
		 */
		
		/**
		 * HTML source that is used to generate markup required for the focus effect.
		 *
		 * @name html.focus
		 * @default '<div class="text-focus"/>'
		 * @author agorbatchev
		 * @date 2011/08/18
		 * @id TextExtFocus.options.html.focus
		 */
		OPT_HTML_FOCUS = 'html.focus',

		/**
		 * Focus plugin dispatches or reacts to the following events.
		 *
		 * @author agorbatchev
		 * @date 2011/08/17
		 * @id TextExtFocus.events
		 */

		/**
		 * Focus plugin reacts to the `focus` event and shows the markup generated from
		 * the `html.focus` option.
		 *
		 * @name focus
		 * @author agorbatchev
		 * @date 2011/08/18
		 * @id TextExtFocus.events.focus
		 */

		/**
		 * Focus plugin reacts to the `blur` event and hides the effect.
		 *
		 * @name blur
		 * @author agorbatchev
		 * @date 2011/08/18
		 * @id TextExtFocus.events.blur
		 */

		DEFAULT_OPTS = {
			html : {
				focus : '<div class="text-focus"/>'
			}
		}
		;

	/**
	 * Initialization method called by the core during plugin instantiation.
	 *
	 * @signature TextExtFocus.init(core)
	 *
	 * @param core {TextExt} Instance of the TextExt core class.
	 *
	 * @author agorbatchev
	 * @date 2011/08/18
	 * @id TextExtFocus.init
	 */
	p.init = function(core)
	{
		var self = this;

		self.baseInit(core, DEFAULT_OPTS);
		self.core().wrapElement().append(self.opts(OPT_HTML_FOCUS));
		self.on({
			blur  : self.onBlur,
			focus : self.onFocus
		});

		self._timeoutId = 0;
	};

	//--------------------------------------------------------------------------------
	// Event handlers
	
	/**
	 * Reacts to the `blur` event and hides the focus effect with a slight delay which 
	 * allows quick refocusing without effect blinking in and out.
	 *
	 * @signature TextExtFocus.onBlur(e)
	 *
	 * @param e {Object} jQuery event.
	 *
	 * @author agorbatchev
	 * @date 2011/08/08
	 * @id TextExtFocus.onBlur
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
	 * Reacts to the `focus` event and shows the focus effect.
	 *
	 * @signature TextExtFocus.onFocus
	 *
	 * @param e {Object} jQuery event.
	 * @author agorbatchev
	 * @date 2011/08/08
	 * @id TextExtFocus.onFocus
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
	 *
	 * @signature TextExtFocus.getFocus()
	 *
	 * @author agorbatchev
	 * @date 2011/08/08
	 * @id TextExtFocus.getFocus
	 */
	p.getFocus = function()
	{
		return this.core().wrapElement().find('.text-focus');
	};
})(jQuery);
