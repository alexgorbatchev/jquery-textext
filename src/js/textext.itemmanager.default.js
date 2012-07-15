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
	function ItemManager()
	{
	};

	var textext = $.fn.textext,
		p       = ItemManager.prototype
		;

	textext.addItemManager('default', ItemManager);
})(jQuery);

