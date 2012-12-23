do (window, $ = jQuery, module = $.fn.textext) ->
  { opts } = module.utils

  class Plugin
    @registery = {}
    @register : (name, constructor) -> @registery[name] = constructor

    constructor : (@userOptions, @defaultOptions = {}) ->
      @plugins = []

    option : (key) -> opts(@userOptions, key) or opts(@defaultOptions, key)

    invalidate : ->
      plugin.invalidate() for plugin in @plugins

    addPlugin : (instance) -> @plugins.push instance

    trigger : -> $(@element).trigger arguments
    bind    : -> $(@element).bind arguments

  module.Plugin = Plugin
