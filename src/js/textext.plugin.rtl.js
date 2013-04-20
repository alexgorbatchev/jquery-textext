/**
 * jQuery TextExt Plugin
 * http://textextjs.com
 *
 * @version 1.3.1
 * @license MIT License
 */
(function($)
{
    /**
     * Rtl plugin enables support for right-to-left languages like Arabic or Hebrew.
     *
     * @author Ori Hoch
     * @date 2013/04/20
     * @id TextExtRtl
     */
    function TextExtRtl() {};

    $.fn.textext.TextExtRtl = TextExtRtl;
    $.fn.textext.addPlugin('rtl', TextExtRtl);
    
    /**
     * Rtl plugin Doesn't have any options, just add the plugin and it should work
     *
     *     $('textarea').textext({
     *         plugins: 'rtl'
     *     })
     *
     * @author Ori Hoch
     * @date 2013/04/20
     * @id TextExtRtl.options
     */
    
    TextExtRtl.prototype.init=function(core){
        this.baseInit(core,{});
        this.core().wrapElement().addClass('text-rtl')
    };
})(jQuery);
