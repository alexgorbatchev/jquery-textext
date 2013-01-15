do (window, $ = jQuery, module = $.fn.textext) ->
  { Plugin } = module

  class TextExt extends Plugin
    @defaults =
      html :
        element : '<div class="textext">'

    constructor : (opts = {}) ->
      @sourceElement = opts.element
      opts.element = null

      super opts, TextExt.defaults

      @sourceElement.hide()
      @sourceElement.after @element

    addToParent : -> null

  module.TextExt = TextExt
