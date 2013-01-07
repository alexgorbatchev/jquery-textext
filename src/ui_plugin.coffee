do (window, $ = jQuery, module = $.fn.textext) ->
  { Plugin } = module

  class UIPlugin extends Plugin
    constructor : (opts = {}, pluginDefaults = {}) ->
      super opts, pluginDefaults
      @element ?= opts.element

    $ : (selector) -> @element.find selector

    appendToParent : ->
      if @parent
        @parent.element.append @element

    init : ->
      unless @element?
        html = @options 'html.element'
        @element = $ html if html?

      super()

      @appendToParent()

  module.UIPlugin = UIPlugin
