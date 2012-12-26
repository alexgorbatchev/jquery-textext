do (window, $ = jQuery, module = $.fn.textext) ->
  { Plugin } = module

  class TextExt extends Plugin
    @defaults =
      plugins          : ''
      autoPlugins      : 'keys'
      availablePlugins : Plugin.registery

      html :
        container : '<div class="textext">'

    constructor : (target, opts = {}) ->
      super(opts)

      @sourceElement = target
      @defaultOptions ?= TextExt.defaults
      @element ?= $ @options 'html.container'

      target.hide()
      target.after @element

      @init()

    init : ->
      @createPlugins @options('autoPlugins')
      @createPlugins @options('plugins')

    createPlugins : (list) ->
      availablePlugins = @options 'availablePlugins'

      unless list.length is 0
        list = list.split /\s*,?\s+/g

        for pluginName in list
          plugin = availablePlugins[pluginName]
          instance = new plugin userOptions : @options pluginName
          @addPlugin pluginName, instance

  module.TextExt = TextExt
