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
	function ItemValidatorSuggestions()
	{
	};

	$.fn.textext.ItemValidatorSuggestions = ItemValidatorSuggestions;
	$.fn.textext.addItemValidator('suggestions', ItemValidatorSuggestions);

	var p = ItemValidatorSuggestions.prototype;

	p.init = function(core)
	{
		this.baseInit(core);
	};

	p.isValid = function(item, callback)
	{
		var self        = this,
			core        = self.core(),
			itemManager = core.itemManager()
			;

		itemManager.getSuggestions(itemManager.itemToString(item), function(err, items)
		{
			callback(err, items && itemManager.compareItems(item, items[0]));
		});
	};
})(jQuery);

