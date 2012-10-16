/**
 * jQuery TextExt Plugin
 * http://textextjs.com
 *
 * @version 1.3.0
 * @copyright Copyright (C) 2011-2012 Alex Gorbatchev. All rights reserved.
 * @license MIT License
 */
(function($, undefined)
{
	function DefaultItemManager()
	{
	};

	$.fn.textext.DefaultItemManager = DefaultItemManager;
	$.fn.textext.addItemManager('default', DefaultItemManager);

	var p = DefaultItemManager.prototype;
})(jQuery);

