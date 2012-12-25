do (window, $ = jQuery, module = $.fn.textext) ->
  { Plugin } = module

  class TextExt extends Plugin
    @defaults =
      plugins : []

      html :
        container : '<div class="textext">'

    constructor : (target, { @element, @userOptions } = {}) ->
      super()

      @defaultOptions = TextExt.defaults

      @sourceElement = target
      @element ?= $ @options 'html.container'

      target.hide()
      target.after @element

    createPlugins : (list, availablePlugins = @options 'plugins') ->
      for key in list.split /\s*,?\s+/g
        plugin = availablePlugins[key]
        instance = new plugin()
        @addPlugin instance

  module.TextExt = TextExt
