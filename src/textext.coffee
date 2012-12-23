do (window, $ = jQuery, module = $.fn.textext) ->
  { Plugin } = module

  class TextExt extends Plugin
    @defaults =
      itemManager   : 'default'
      itemValidator : 'default'
      dataSource    : null
      plugins       : []
      ext           : {}

      html :
        wrap   : '<div class="text-core"><div class="text-wrap"/></div>'
        hidden : '<input type="hidden" />'

    constructor : (@element, userOptions) ->
      super $.extend {}, TextExt.defaults, userOptions

    invalidate : ->
      super()

  module.TextExt = TextExt
