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
    function SuggestionsItemValidator()
    {
    };

    $.fn.textext.SuggestionsItemValidator = SuggestionsItemValidator;
    $.fn.textext.addItemValidator('suggestions', SuggestionsItemValidator);

    var p = SuggestionsItemValidator.prototype;

    p.init = function(core)
    {
        var self = this;

        self.baseInit(core);
        self.on({ enterKeyPress : self.onEnterKeyPress });
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

    p.onEnterKeyPress = function(e)
    {
        var self = this;

        self.isValid(self.val(), function(err, isValid)
        {
            if(isValid)
                self.core().invalidateData();
        });
    };

    p.getFormData = function(callback)
    {
        var self        = this,
            itemManager = self.itemManager(),
            inputValue  = self.val(),
            formValue
            ;

        itemManager.stringToItem(inputValue, function(err, item)
        {
            formValue = itemManager.serialize(item);
            callback(null, formValue, inputValue);
        });
    };
})(jQuery);

