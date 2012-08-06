/**
 * jQuery TextExt Plugin
 * http://textextjs.com
 *
 * @version 1.3.0
 * @copyright Copyright (C) 2011 Alex Gorbatchev. All rights reserved.
 * @license MIT License
 */
(function($)
{
	/**
	 * Displays a dropdown style arrow button. The `ArrowPlugin` works together with the
	 * `TextExtAutocomplete` plugin and whenever clicked tells the autocomplete plugin to
	 * display its suggestions.
	 *
	 * @author agorbatchev
	 * @date 2011/12/27
	 * @id ArrowPlugin
	 */
	function ArrowPlugin() {};

	$.fn.textext.ArrowPlugin = ArrowPlugin;
	$.fn.textext.addPlugin('arrow', ArrowPlugin);

	var p = ArrowPlugin.prototype,
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
		 * @id ArrowPlugin.options
		 */
		
		/**
		 * HTML source that is used to generate markup required for the arrow.
		 *
		 * @name html.arrow
		 * @default '<div class="text-arrow"/>'
		 * @author agorbatchev
		 * @date 2011/12/27
		 * @id ArrowPlugin.options.html.arrow
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
	 * @signature ArrowPlugin.init(core)
	 *
	 * @param core {TextExt} Instance of the TextExt core class.
	 *
	 * @author agorbatchev
	 * @date 2011/12/27
	 * @id ArrowPlugin.init
	 */
	p.init = function(core)
	{
		var self = this,
			arrow
			;

		self.baseInit(core, DEFAULT_OPTS);

		self._arrow = arrow = $(self.opts(OPT_HTML_ARROW));
		self.core().wrapElement().append(arrow);

		self.on(arrow, {
			click : self.onArrowClick
		});
	};

	//--------------------------------------------------------------------------------
	// Event handlers
	
	/**
	 * Reacts to the `click` event whenever user clicks the arrow.
	 *
	 * @signature ArrowPlugin.onArrowClick(e)
	 *
	 * @param e {Object} jQuery event.
	 * @author agorbatchev
	 * @date 2011/12/27
	 * @id ArrowPlugin.onArrowClick
	 */
	p.onArrowClick = function(e)
	{
		var self         = this,
			core         = self.core(),
			autocomplete = core.autocomplete && core.autocomplete()
			;

		if(autocomplete)
		{
			autocomplete.renderSuggestions();
			core.focusInput();
		}
	};
})(jQuery);
