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
	function ItemValidatorDefault()
	{
	};

	$.fn.textext.ItemValidatorDefault = ItemValidatorDefault;
	$.fn.textext.addItemValidator('default', ItemValidatorDefault);

	var p = ItemValidatorDefault.prototype;

	p.init = function(core)
	{
		this.baseInit(core);
	};

	p.isValid = function(item, callback)
	{
		callback(null, true);
	};
})(jQuery);

