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
	 * Suggestions plugin allows to easily specify the list of suggestion items that the
	 * Autocomplete plugin would present to the user.
	 *
	 * @author agorbatchev
	 * @date 2011/08/18
	 * @id TextExtSuggestions
	 */
	function TextExtSuggestions() {};

	$.fn.textext.TextExtSuggestions = TextExtSuggestions;
	$.fn.textext.addPlugin('suggestions', TextExtSuggestions);

	var p = TextExtSuggestions.prototype,
		/**
		 * Suggestions plugin only has one option and that is to set suggestion items. It could be 
		 * changed when passed to the `$().textext()` function. For example:
		 *
		 *     $('textarea').textext({
		 *         plugins: 'suggestions',
		 *         suggestions: [ "item1", "item2" ]
		 *     })
		 *
		 * @author agorbatchev
		 * @date 2011/08/18
		 * @id TextExtSuggestions.options
		 */

		/**
		 * List of items that Autocomplete plugin would display in the dropdown.
		 *
		 * @name suggestions
		 * @default null
		 * @author agorbatchev
		 * @date 2011/08/18
		 * @id TextExtSuggestions.options.suggestions
		 */
		OPT_SUGGESTIONS = 'suggestions',

		/**
		 * Suggestions plugin dispatches or reacts to the following events.
		 *
		 * @author agorbatchev
		 * @date 2011/08/17
		 * @id TextExtSuggestions.events
		 */

		/**
		 * Suggestions plugin reacts to the `getSuggestions` event and returns `suggestions` items
		 * from the options.
		 *
		 * @name getSuggestions
		 * @author agorbatchev
		 * @date 2011/08/19
		 * @id TextExtSuggestions.events.getSuggestions
		 */

		/**
		 * Suggestions plugin triggers the `setSuggestions` event to pass its own list of `Suggestions`
		 * to the Autocomplete plugin.
		 *
		 * @name setSuggestions
		 * @author agorbatchev
		 * @date 2011/08/19
		 * @id TextExtSuggestions.events.setSuggestions
		 */

		/**
		 * Suggestions plugin reacts to the `postInit` event to pass its list of `suggestions` to the
		 * Autocomplete right away.
		 *
		 * @name postInit
		 * @author agorbatchev
		 * @date 2011/08/19
		 * @id TextExtSuggestions.events.postInit
		 */

		DEFAULT_OPTS = {
			suggestions : null
		}
		;

	/**
	 * Initialization method called by the core during plugin instantiation.
	 *
	 * @signature TextExtSuggestions.init(core)
	 *
	 * @param core {TextExt} Instance of the TextExt core class.
	 *
	 * @author agorbatchev
	 * @date 2011/08/18
	 * @id TextExtSuggestions.init
	 */
	p.init = function(core)
	{
		var self = this;

		self.baseInit(core, DEFAULT_OPTS);

		self.on({
			getSuggestions : self.onGetSuggestions,
			postInit       : self.onPostInit
		});
	};

	/**
	 * Triggers `setSuggestions` and passes supplied suggestions to the Autocomplete plugin.
	 *
	 * @signature TextExtSuggestions.setSuggestions(suggestions, showHideDropdown)
	 *
	 * @param suggestions {Array} List of suggestions. With the default `ItemManager` it should
	 * be a list of strings.
	 * @param showHideDropdown {Boolean} If it's undesirable to show the dropdown right after
	 * suggestions are set, `false` should be passed for this argument.
	 *
	 * @author agorbatchev
	 * @date 2011/08/19
	 * @id TextExtSuggestions.setSuggestions
	 */
	p.setSuggestions = function(suggestions, showHideDropdown)
	{
		this.trigger('setSuggestions', { result : suggestions, showHideDropdown : showHideDropdown != false });
	};

	/**
	 * Reacts to the `postInit` event and triggers `setSuggestions` event to set suggestions list 
	 * right after initialization.
	 *
	 * @signature TextExtSuggestions.onPostInit(e)
	 *
	 * @param e {Object} jQuery event.
	 *
	 * @author agorbatchev
	 * @date 2011/08/19
	 * @id TextExtSuggestions.onPostInit
	 */
	p.onPostInit = function(e)
	{
		var self = this;
		self.setSuggestions(self.opts(OPT_SUGGESTIONS), false);
	};

	/**
	 * Reacts to the `getSuggestions` event and triggers `setSuggestions` event with the list
	 * of `suggestions` specified in the options.
	 *
	 * @signature TextExtSuggestions.onGetSuggestions(e, data)
	 *
	 * @param e {Object} jQuery event.
	 * @param data {Object} Payload from the `getSuggestions` event with the user query, eg `{ query: {String} }`.
	 *
	 * @author agorbatchev
	 * @date 2011/08/19
	 * @id TextExtSuggestions.onGetSuggestions
	 */
	p.onGetSuggestions = function(e, data)
	{
		var self        = this,
			suggestions = self.opts(OPT_SUGGESTIONS)
			;

		suggestions.sort();
		self.setSuggestions(self.itemManager().filter(suggestions, data.query));
	};
})(jQuery);
