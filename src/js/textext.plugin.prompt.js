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
	 * Prompt plugin displays a visual user propmpt in the text input area. If user focuses
	 * on the input, the propt is hidden and only shown again when user focuses on another
	 * element and text input doesn't have a value.
	 *
	 * @author agorbatchev
	 * @date 2011/08/18
	 * @id PromptPlugin
	 */
	function PromptPlugin() {};

	$.fn.textext.PromptPlugin = PromptPlugin;
	$.fn.textext.addPlugin('prompt', PromptPlugin);

	var p = PromptPlugin.prototype,

		CSS_HIDE_PROMPT = 'text-hide-prompt',

		/**
		 * Prompt plugin has options to change the prompt label and its HTML template. The options
		 * could be changed when passed to the `$().textext()` function. For example:
		 *
		 *     $('textarea').textext({
		 *         plugins: 'prompt',
		 *         prompt: 'Your email address'
		 *     })
		 *
		 * @author agorbatchev
		 * @date 2011/08/18
		 * @id PromptPlugin.options
		 */

		/**
		 * Prompt message that is displayed to the user whenever there's no value in the input.
		 *
		 * @name prompt
		 * @default 'Awaiting input...'
		 * @author agorbatchev
		 * @date 2011/08/18
		 * @id PromptPlugin.options.prompt
		 */
		OPT_PROMPT = 'prompt',

		/**
		 * HTML source that is used to generate markup required for the prompt effect.
		 *
		 * @name html.prompt
		 * @default '<div class="text-prompt"/>'
		 * @author agorbatchev
		 * @date 2011/08/18
		 * @id PromptPlugin.options.html.prompt
		 */
		OPT_HTML_PROMPT = 'html.prompt',

		/**
		 * Prompt plugin dispatches or reacts to the following events.
		 * @id PromptPlugin.events
		 */

		/**
		 * Prompt plugin reacts to the `focus` event and hides the markup generated from
		 * the `html.prompt` option.
		 *
		 * @name focus
		 * @author agorbatchev
		 * @date 2011/08/18
		 * @id PromptPlugin.events.focus
		 */

		/**
		 * Prompt plugin reacts to the `blur` event and shows the prompt back if user
		 * hasn't entered any value.
		 *
		 * @name blur
		 * @author agorbatchev
		 * @date 2011/08/18
		 * @id PromptPlugin.events.blur
		 */
	
		DEFAULT_OPTS = {
			prompt : 'Awaiting input...',

			html : {
				prompt : '<div class="text-prompt"/>'
			}
		}
		;

	/**
	 * Initialization method called by the core during plugin instantiation.
	 *
	 * @signature PromptPlugin.init(core)
	 *
	 * @param core {TextExt} Instance of the TextExt core class.
	 *
	 * @author agorbatchev
	 * @date 2011/08/18
	 * @id PromptPlugin.init
	 */
	p.init = function(core)
	{
		var self           = this,
			placeholderKey = 'placeholder',
			container,
			prompt
			;

		self.baseInit(core, DEFAULT_OPTS);
		
		container = $(self.opts(OPT_HTML_PROMPT));
		$(self).data('container', container);

		self.core().wrapElement().append(container);
		self.setPrompt(self.opts(OPT_PROMPT));
		
		prompt = core.input().attr(placeholderKey);

		if(!prompt)
			prompt = self.opts(OPT_PROMPT);

		// clear placeholder attribute if set
		core.input().attr(placeholderKey, '');

		if(prompt)
			self.setPrompt(prompt);

		if($.trim(self.val()).length > 0)
			self.hidePrompt();

		self.on({
			blur           : self.onBlur,
			focus          : self.onFocus,
			postInvalidate : self.onPostInvalidate,
			postInit       : self.onPostInit
		});
	};

	//--------------------------------------------------------------------------------
	// Event handlers
	
	/**
	 * Reacts to the `postInit` and configures the plugin for initial display.
	 *
	 * @signature PromptPlugin.onPostInit(e)
	 *
	 * @param e {Object} jQuery event.
	 *
	 * @author agorbatchev
	 * @date 2011/08/24
	 * @id PromptPlugin.onPostInit
	 */
	p.onPostInit = function(e)
	{
		this.invalidateBounds();
	};

	/**
	 * Reacts to the `postInvalidate` and insures that prompt display remains correct.
	 *
	 * @signature PromptPlugin.onPostInvalidate(e)
	 *
	 * @param e {Object} jQuery event.
	 *
	 * @author agorbatchev
	 * @date 2011/08/24
	 * @id PromptPlugin.onPostInvalidate
	 */
	p.onPostInvalidate = function(e)
	{
		this.invalidateBounds();
	};

	/**
	 * Repositions the prompt to make sure it's always at the same place as in the text input carret.
	 *
	 * @signature PromptPlugin.invalidateBounds()
	 *
	 * @author agorbatchev
	 * @date 2011/08/24
	 * @id PromptPlugin.invalidateBounds
	 */
	p.invalidateBounds = function()
	{
		var self  = this,
			input = self.input()
			;

		self.containerElement().css({
			paddingLeft : input.css('paddingLeft'),
			paddingTop  : input.css('paddingTop')
		});
	};

	/**
	 * Reacts to the `blur` event and shows the prompt effect with a slight delay which 
	 * allows quick refocusing without effect blinking in and out.
	 *
	 * The prompt is restored if the text box has no value.
	 *
	 * @signature PromptPlugin.onBlur(e)
	 *
	 * @param e {Object} jQuery event.
	 *
	 * @author agorbatchev
	 * @date 2011/08/08
	 * @id PromptPlugin.onBlur
	 */
	p.onBlur = function(e)
	{
		var self = this;

		self.startTimer('prompt', 0.1, function()
		{
			self.showPrompt();
		});
	};

	/**
	 * Shows prompt HTML element.
	 *
	 * @signature PromptPlugin.showPrompt()
	 *
	 * @author agorbatchev
	 * @date 2011/08/22
	 * @id PromptPlugin.showPrompt
	 */
	p.showPrompt = function()
	{
		var self     = this,
			input    = self.input()
			;
		
		if($.trim(self.val()).length === 0 && !input.is(':focus'))
			self.containerElement().removeClass(CSS_HIDE_PROMPT);
	};

	/**
	 * Hides prompt HTML element.
	 *
	 * @signature PromptPlugin.hidePrompt()
	 *
	 * @author agorbatchev
	 * @date 2011/08/22
	 * @id PromptPlugin.hidePrompt
	 */
	p.hidePrompt = function()
	{
		this.stopTimer('prompt');
		this.containerElement().addClass(CSS_HIDE_PROMPT);
	};

	/**
	 * Reacts to the `focus` event and hides the prompt effect.
	 *
	 * @signature PromptPlugin.onFocus
	 *
	 * @param e {Object} jQuery event.
	 * @author agorbatchev
	 * @date 2011/08/08
	 * @id PromptPlugin.onFocus
	 */
	p.onFocus = function(e)
	{
		this.hidePrompt();
	};
	
	//--------------------------------------------------------------------------------
	// Core functionality

	/**
	 * Sets the prompt display to the specified string.
	 *
	 * @signature PromptPlugin.setPrompt(str)
	 *
	 * @oaram str {String} String that will be displayed in the prompt.
	 *
	 * @author agorbatchev
	 * @date 2011/08/18
	 * @id PromptPlugin.setPrompt
	 */
	p.setPrompt = function(str)
	{
		this.containerElement().text(str);
	};

	/**
	 * Returns prompt effect HTML element.
	 *
	 * @signature PromptPlugin.containerElement()
	 *
	 * @author agorbatchev
	 * @date 2011/08/08
	 * @id PromptPlugin.containerElement
	 */
	p.containerElement = function()
	{
		return $(this).data('container');
	};
})(jQuery);
