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
	 * The Filter plugin introduces ability to limit input that the text field
	 * will accept. If the Tags plugin is used, Filter plugin will limit which
	 * tags it's possible to add.
	 *
	 * The list of allowed items can be either specified through the
	 * options, can come from the Suggestions plugin or be loaded by the Ajax 
	 * plugin. All these plugins have one thing in common -- they 
	 * trigger `setSuggestions` event which the Filter plugin is expecting.
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
			getFormData    : self.onGetFormData,
			isTagAllowed   : self.onIsTagAllowed,
			setSuggestions : self.onSetSuggestions
		});

		self._suggestions = null;
	};

	//--------------------------------------------------------------------------------
	// Core functionality

	/**
	 * Reacts to the [`getFormData`][1] event triggered by the core. Returns data with the
	 * weight of 200 to be *greater than the Autocomplete plugins* data weights. 
	 * The weights system is covered in greater detail in the [`getFormData`][1] event 
	 * documentation.
	 *
	 * This method does nothing if Tags tag is also present.
	 *
	 * [1]: /manual/textext.html#getformdata
	 *
	 * @signature TextExtFilter.onGetFormData(e, data, keyCode)
	 *
	 * @param e {Object} jQuery event.
	 * @param data {Object} Data object to be populated.
	 * @param keyCode {Number} Key code that triggered the original update request.
	 *
	 * @author agorbatchev
	 * @date 2011/12/28
	 * @id TextExtFilter.onGetFormData
	 * @version 1.1
	 */
	p.onGetFormData = function(e, data, keyCode)
	{
		var self       = this,
			val        = self.val(),
			inputValue = val,
			formValue  = ''
			;

		if(!self.core().hasPlugin('tags'))
		{
			if(self.isValueAllowed(inputValue))
				formValue = val;

			data[300] = self.formDataObject(inputValue, formValue);
		}
	};

	/**
	 * Checks given value if it's present in `filterItems` or was loaded for the Autocomplete
	 * or by the Suggestions plugins. `value` is compared to each item using `ItemManager.compareItems`
	 * method which is currently attached to the core. Returns `true` if value is known or
	 * Filter plugin is disabled.
	 *
	 * @signature TextExtFilter.isValueAllowed(value)
	 *
	 * @param value {Object} Value to check.
	 *
	 * @author agorbatchev
	 * @date 2011/12/28
	 * @id TextExtFilter.isValueAllowed
	 * @version 1.1
	 */
	p.isValueAllowed = function(value)
	{
		var self        = this,
			list        = self.opts('filterItems') || self._suggestions || [],
			itemManager = self.itemManager(),
			result      = !self.opts(OPT_ENABLED), // if disabled, should just return true
			i
			;

		for(i = 0; i < list.length && !result; i++)
			if(itemManager.compareItems(value, list[i]))
				result = true;

		return result;
	};

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
		data.result = this.isValueAllowed(data.tag);
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
		this._suggestions = data.result;
	};
})(jQuery);
