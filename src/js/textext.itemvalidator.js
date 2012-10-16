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
	function ItemValidator()
	{
	};

	var textext = $.fn.textext,
		p       = ItemValidator.prototype = new textext.Plugin()
		;
		
	textext.ItemValidator = ItemValidator;

	p.init = function(core)
	{
		this.baseInit(core);
	};

	p.isValid = function(item, callback)
	{
		throw new Error('TextExt.js: please implement `ItemValidator.isValid`');
	};
})(jQuery);

