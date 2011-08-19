(function($)
{
	/**
	 * The Filter plugin introduces ability to limit tags that the Tags plugin
	 * will accept. The list of allowed tags can be either hardcoded, can come 
	 * from the Suggestions plugin or be loaded by the Ajax plugin. All these 
	 * "support" plugins have one thing in common -- they trigger `setSuggestions`
	 * event which the Filter plugin is expecting.
	 * 
	 * @author agorbatchev
	 * @date 2011/08/18
	 * @id TextExtFilter
	 */
	function TextExtFilter() {};

	$.fn.textext.TextExtFilter = TextExtFilter;
	$.fn.textext.addPlugin('filter', TextExtFilter);

	var p = TextExtFilter.prototype,

		/**
		 * Filter plugin options are grouped under `filter` when passed to the 
		 * `$().textext()` function. For example:
		 *
		 *     $('textarea').textext({
		 *         plugins: 'filter',
		 *         filter: {
		 *             items: [ "item1", "item2" ]
		 *         }
		 *     })
		 *
		 * @author agorbatchev
		 * @date 2011/08/18
		 * @id TextExtFilter.options
		 */
		
		/**
		 * This is a toggle switch to enable or disable the Filter plugin. The value is checked
		 * each time at the top level which allows you to toggle this setting on the fly.
		 *
		 * @name filter.enabled
		 * @default true
		 * @author agorbatchev
		 * @date 2011/08/18
		 * @id TextExtFilter.options.enabled
		 */
		OPT_ENABLED = 'filter.enabled',

		/**
		 * Arra of items that the Filter plugin will allow the Tag plugin to add to the list of
		 * its resut tags. Each item by default is expected to be a string which default `ItemManager`
		 * can work with. You can change the item type by supplying custom `ItemManager`.
		 *
		 * @name filter.items
		 * @default null
		 * @author agorbatchev
		 * @date 2011/08/18
		 * @id TextExtFilter.options.items
		 */
		OPT_ITEMS = 'filter.items',

		/**
		 * Filter plugin dispatches and reacts to the following events.
		 *
		 * @author agorbatchev
		 * @date 2011/08/18
		 * @id TextExtFilter.events
		 */

		/**
		 * Filter plugin reacts to the `isTagAllowed` event triggered by the Tags plugin before
		 * adding a new tag to the list. If the new tag is among the `items` specified in options,
		 * then the new tag will be allowed.
		 *
		 * @name isTagAllowed
		 * @author agorbatchev
		 * @date 2011/08/18
		 * @id TextExtFilter.events.isTagAllowed
		 */

		/**
		 * Filter plugin reacts to the `setSuggestions` event triggered by other plugins like 
		 * Suggestions and Ajax.
		 *
		 * However, event if this event is handled and items are passed with it and stored, if `items`
		 * option was supplied, it will always take precedense.
		 *
		 * @name setSuggestions
		 * @author agorbatchev
		 * @date 2011/08/18
		 * @id TextExtFilter.events.setSuggestions
		 */

		DEFAULT_OPTS = {
			filter : {
				enabled : true,
				items : null
			}
		}
		;

	/**
	 * Initialization method called by the core during plugin instantiation.
	 *
	 * @signature TextExtFilter.init(core)
	 *
	 * @param core {TextExt} Instance of the TextExt core class.
	 *
	 * @author agorbatchev
	 * @date 2011/08/18
	 * @id TextExtFilter.init
	 */
	p.init = function(core)
	{
		var self = this;
		self.baseInit(core, DEFAULT_OPTS);

		self.on({
			isTagAllowed   : self.onIsTagAllowed,
			setSuggestions : self.onSetSuggestions
		});

		self._suggestions = null;
	};

	//--------------------------------------------------------------------------------
	// Core functionality

	/**
	 * Handles `isTagAllowed` event dispatched by the Tags plugin. If supplied tag is not
	 * in the `items` list, method sets `result` on the `data` argument to `false`.
	 *
	 * @signature TextExtFilter.onIsTagAllowed(e, data)
	 *
	 * @param e {Object} jQuery event.
	 * @param data {Object} Payload in the following format : `{ tag : {Object}, result : {Boolean} }`.
	 * @author agorbatchev
	 * @date 2011/08/04
	 * @id TextExtFilter.onIsTagAllowed
	 */
	p.onIsTagAllowed = function(e, data)
	{
		var self = this,
			list = self.opts('filterItems') || self.suggestions() || [],
			i
			;

		if(!self.opts('filterEnabled'))
			return;

		data.result = false;

		for(i = 0; i < list.length; i++)
			if(self.itemManager().compareItems(data.tag, list[i]))
				return data.result = true;
	};

	/**
	 * Reacts to the `setSuggestions` events and stores supplied suggestions for future use.
	 * 
	 * @signature TextExtFilter.onSetSuggestions(e, data)
	 *
	 * @param e {Object} jQuery event.
	 * @param data {Object} Payload in the following format : `{ result : {Array} } }`.
	 * @author agorbatchev
	 * @date 2011/08/18
	 * @id TextExtFilter.onSetSuggestions
	 */
	p.onSetSuggestions = function(e, data)
	{
		this.suggestions(data.result);
	};

	/**
	 * Gets or sets suggestions list passed through the `setSuggestions` event.
	 *
	 * @signature TextExtFilter.suggestions(value)
	 *
	 * @param value {Array} If specified, stores the value, otherwise current value is returned.
	 * @author agorbatchev
	 * @date 2011/08/18
	 * @id TextExtFilter.suggestions
	 */
	p.suggestions = function(value)
	{
		var self = this;
		return self._suggestion = value || self._suggestion;
	};
})(jQuery);
