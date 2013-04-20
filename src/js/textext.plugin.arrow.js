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
	 * Displays a dropdown style arrow button. The `TextExtArrow` works together with the
	 * `TextExtAutocomplete` plugin and whenever clicked tells the autocomplete plugin to
	 * display its suggestions.
	 *
	 * @author agorbatchev
	 * @date 2011/12/27
	 * @id TextExtArrow
	 */
	function TextExtArrow() {};

	$.fn.textext.TextExtArrow = TextExtArrow;
	$.fn.textext.addPlugin('arrow', TextExtArrow);

	var p = TextExtArrow.prototype,
		/**
		 * Arrow plugin only has one option and that is its HTML template. It could be 
		 * changed when passed to the `$().textext()` function. For example:
		 *
		 *     $('textarea').textext({
		 *         plugins: 'arrow',
		 *         html: {
		 *             arrow: "<span/>"
		 *         }
		 *     })
		 *
		 * @author agorbatchev
		 * @date 2011/12/27
		 * @id TextExtArrow.options
		 */
		
		/**
		 * HTML source that is used to generate markup required for the arrow.
		 *
		 * @name html.arrow
		 * @default '<div class="text-arrow"/>'
		 * @author agorbatchev
		 * @date 2011/12/27
		 * @id TextExtArrow.options.html.arrow
		 */
		OPT_HTML_ARROW = 'html.arrow',

		DEFAULT_OPTS = {
			html : {
				arrow : '<div class="text-arrow"/>'
			}
		}
		;

	/**
	 * Initialization method called by the core during plugin instantiation.
	 *
	 * @signature TextExtArrow.init(core)
	 *
	 * @param core {TextExt} Instance of the TextExt core class.
	 *
	 * @author agorbatchev
	 * @date 2011/12/27
	 * @id TextExtArrow.init
	 */
	p.init = function(core)
	{
		var self = this,
			arrow
			;

		self.baseInit(core, DEFAULT_OPTS);

		self._arrow = arrow = $(self.opts(OPT_HTML_ARROW));
		self.core().wrapElement().append(arrow);
		arrow.bind('click', function(e) { self.onArrowClick(e); });
	};

	//--------------------------------------------------------------------------------
	// Event handlers
	
	/**
	 * Reacts to the `click` event whenever user clicks the arrow.
	 *
	 * @signature TextExtArrow.onArrowClick(e)
	 *
	 * @param e {Object} jQuery event.
	 * @author agorbatchev
	 * @date 2011/12/27
	 * @id TextExtArrow.onArrowClick
	 */
	p.onArrowClick = function(e)
	{
		this.trigger('toggleDropdown');
		this.core().focusInput();
	};
	
	//--------------------------------------------------------------------------------
	// Core functionality

})(jQuery);
