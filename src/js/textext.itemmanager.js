/**
 * jQuery TextExt Plugin
 * http://textextjs.com
 *
 * @version 1.3.0
 * @copyright Copyright (C) 2011 Alex Gorbatchev. All rights reserved.
 * @license MIT License
 */
(function($, undefined)
{
	/**
	 * ItemManager is used to seamlessly convert between string that come from the user input to whatever 
	 * the format the item data is being passed around in. It's used by all plugins that in one way or 
	 * another operate with items, such as Tags, Filter, Autocomplete and Suggestions. Default implementation 
	 * works with `String` type. 
	 *
	 * Each instance of `TextExt` creates a new instance of default implementation of `ItemManager`
	 * unless `itemManager` option was set to another implementation.
	 *
	 * To satisfy requirements of managing items of type other than a `String`, different implementation
	 * if `ItemManager` should be supplied.
	 *
	 * If you wish to bring your own implementation, you need to create a new class and implement all the 
	 * methods that `ItemManager` has. After, you need to supply your pass via the `itemManager` option during
	 * initialization like so:
	 *
	 *     $('#input').textext({
	 *         itemManager : CustomItemManager
	 *     })
	 *
	 * New in <span class="label version">1.4</span> is ability to inline `ItemManager` as an object 
	 * instead of a constructor. Here's an example:
	 *
	 *     $('#input').textext({
	 *         itemManager : {
	 *             init : function(core)
	 *             {
	 *             },
	 *     
	 *             filter : function(list, query)
	 *             {
	 *             },
	 *     
	 *             itemContains : function(item, needle)
	 *             {
	 *             },
	 *     
	 *             stringToItem : function(str)
	 *             {
	 *             },
	 *     
	 *             itemToString : function(item)
	 *             {
	 *             },
	 *     
	 *             compareItems : function(item1, item2)
	 *             {
	 *             }
	 *         }
	 *     })
	 *
	 * @author agorbatchev
	 * @date 2011/08/19
	 * @id ItemManager
	 */
	function ItemManager() {};

	var plugin = $.fn.textext,
		p      = ItemManager.prototype
		;

	plugin.addItemManager('default', ItemManager);

	/**
	 * Initialization method called by the core during instantiation.
	 *
	 * @signature ItemManager.init(core)
	 *
	 * @param core {TextExt} Instance of the TextExt core class.
	 *
	 * @author agorbatchev
	 * @date 2011/08/19
	 * @id ItemManager.init
	 */
	p.init = function(core)
	{
	};

	/**
	 * Stores current dataset in the `ItemManager` instance for further use.
	 *
	 * @signature ItemManager.setSuggestions(suggestions)
	 *
	 * @param suggestions {Array} List of items. Default implementation works with array of strings.
	 *
	 * @author agorbatchev
	 * @date 2012/06/13
	 * @id ItemManager.setSuggestions
	 * @version 1.4
	 */
	p.setSuggestions = function(suggestions)
	{
		this._suggestions = suggestions;
	};

	/**
	 * Returns stored suggestions.
	 *
	 * @signature ItemManager.getSuggestions()
	 *
	 * @author agorbatchev
	 * @date 2012/06/16
	 * @id ItemManager.getSuggestions
	 * @version 1.4
	 */
	p.getSuggestions = function(callback)
	{
		return this._suggestions;
	};

	/**
	 * Filters out items from the list that don't match the query and returns remaining items. Default 
	 * implementation checks if the string item starts with the query. Should be using the data that
	 * is passed to the `setSuggestions` method.
	 *
	 * @signature ItemManager.filter(query)
	 *
	 * @param query {String} Query string.
	 *
	 * @author agorbatchev
	 * @date 2011/08/19
	 * @id ItemManager.filter
	 */
	p.filter = function(query)
	{
		var self   = this,
			result = [],
			data   = self._suggestions,
			item,
			i
			;

		if(data)
			for(i = 0; i < data.length; i++)
			{
				item = data[i];

				if(self.itemContains(item, query))
					result.push(item);
			}

		return result;
	};

	/**
	 * Returns `true` if specified item contains another string, `false` otherwise. In the default implementation 
	 * `String.indexOf()` is used to check if item string begins with the needle string.
	 *
	 * @signature ItemManager.itemContains(item, needle)
	 *
	 * @param item {Object} Item to check. Default implementation works with strings.
	 * @param needle {String} Search string to be found within the item.
	 *
	 * @author agorbatchev
	 * @date 2011/08/19
	 * @id ItemManager.itemContains
	 */
	p.itemContains = function(item, needle)
	{
		return this.itemToString(item).toLowerCase().indexOf(needle.toLowerCase()) == 0;
	};

	/**
	 * Converts specified string to item. Because default implemenation works with string, input string
	 * is simply returned back. To use custom objects, different implementation of this method could
	 * return something like `{ name : {String} }`.
	 *
	 * @signature ItemManager.stringToItem(str)
	 *
	 * @param str {String} Input string.
	 *
	 * @author agorbatchev
	 * @date 2011/08/19
	 * @id ItemManager.stringToItem
	 */
	p.stringToItem = function(str)
	{
		return str;
	};

	/**
	 * Converts specified item to string. Because default implemenation works with string, input string
	 * is simply returned back. To use custom objects, different implementation of this method could
	 * for example return `name` field of `{ name : {String} }`.
	 *
	 * @signature ItemManager.itemToString(item)
	 *
	 * @param item {Object} Input item to be converted to string.
	 *
	 * @author agorbatchev
	 * @date 2011/08/19
	 * @id ItemManager.itemToString
	 */
	p.itemToString = function(item)
	{
		return item;
	};

	/**
	 * Returns `true` if both items are equal, `false` otherwise. Because default implemenation works with 
	 * string, input items are compared as strings. To use custom objects, different implementation of this 
	 * method could for example compare `name` fields of `{ name : {String} }` type object.
	 *
	 * @signature ItemManager.compareItems(item1, item2)
	 *
	 * @param item1 {Object} First item.
	 * @param item2 {Object} Second item.
	 *
	 * @author agorbatchev
	 * @date 2011/08/19
	 * @id ItemManager.compareItems
	 */
	p.compareItems = function(item1, item2)
	{
		return item1 == item2;
	};
})(jQuery);

