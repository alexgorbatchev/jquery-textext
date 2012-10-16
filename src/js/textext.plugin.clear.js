/**
 * jQuery TextExt Plugin
 * http://alexgorbatchev.com/textext
 *
 * @version 1.3.1
 * @copyright Copyright (C) 2011 Alex Gorbatchev. All rights reserved.
 * @license MIT License
 */
(function($)
{
	/**
	 * Displays a clear search button.
	 *
	 * @author mreinstein
	 * @date 2012/02/19
	 * @id TextExtClear
	 */
	function TextExtClear() {};

	$.fn.textext.TextExtClear = TextExtClear;
	$.fn.textext.addPlugin('clear', TextExtClear);

	var p = TextExtClear.prototype,
		/**
		 * Clear plugin only has one option and that is its HTML template. It could be 
		 * changed when passed to the `$().textext()` function. For example:
		 *
		 *     $('textarea').textext({
		 *         plugins: 'clear',
		 *         html: {
		 *             clear: "<span/>"
		 *         }
		 *     })
		 *
		 * @author mreinstein
		 * @date 2012/02/19
		 * @id TextExtClear.options
		 */

		/**
		 * HTML source that is used to generate markup required for the clear.
		 *
		 * @name html.clear
		 * @default '<div class="text-clear"/>'
		 * @author mreinstein
		 * @date 2012/02/19
		 * @id TextExtClear.options.html.clear
		 */
		OPT_HTML_CLEAR = 'html.clear',

		DEFAULT_OPTS = {
			html : {
				clear : '<div class="text-clear"/>'
			}
		};

	/**
	 * Initialization method called by the core during plugin instantiation.
	 *
	 * @signature TextExtClear.init(core)
	 *
	 * @param core {TextExt} Instance of the TextExt core class.
	 *
	 * @author agorbatchev
	 * @date 2011/12/27
	 * @id TextExtClear.init
	 */
	p.init = function(core)
	{
		var self = this,
			clear
			;

		self.baseInit(core, DEFAULT_OPTS);

		self._clear = clear = $(self.opts(OPT_HTML_CLEAR));
		self.core().wrapElement().append(clear);
		clear.bind('click', function(e) { self.onClearClick(e); });
	};

	//--------------------------------------------------------------------------------
	// Event handlers

	/**
	 * Reacts to the `click` event whenever user clicks the clear.
	 *
	 * @signature TextExtClear.onClearClick(e)
	 *
	 * @param e {Object} jQuery event.
	 * @author agorbatchev
	 * @date 2011/12/27
	 * @id TextExtClear.onClearClick
	 */
	p.onClearClick = function(e)
	{
		var self = this;

		// check if the tags plugin is present
		if(typeof self.core()._plugins.tags != 'undefined')
		{
			// it is! remove all tags 
			var elems = self.core()._plugins.tags.tagElements();
			for(var i =0; i < elems.length;i++)
			{
				self.core()._plugins.tags.removeTag($(elems[i]));
			}
		}
		// clear the text from the search area
		self.val('');
		self.core().getFormData();
	};

	//--------------------------------------------------------------------------------
	// Core functionality

})(jQuery);