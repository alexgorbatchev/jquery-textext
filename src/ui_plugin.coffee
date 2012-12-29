do (window, $ = jQuery, module = $.fn.textext) ->
  { Plugin } = module

  class UIPlugin extends Plugin
    constructor : (opts = {}, pluginDefaults = {}) ->
      super opts, pluginDefaults

      @element ?= opts.element

    $ : (selector) -> @element.find selector
    appendToParent : -> @parent.element.append @element

  module.UIPlugin = UIPlugin
