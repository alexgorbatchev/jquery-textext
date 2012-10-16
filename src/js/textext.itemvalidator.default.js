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
	function DefaultItemValidator()
	{
	};

	$.fn.textext.DefaultItemValidator = DefaultItemValidator;
	$.fn.textext.addItemValidator('default', DefaultItemValidator);

	var p = DefaultItemValidator.prototype;

	p.init = function(core)
	{
		this.baseInit(core);
	};

	p.isValid = function(item, callback)
	{
		callback(null, item && item.length > 0);
	};
})(jQuery);

