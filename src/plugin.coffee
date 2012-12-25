do (window, $ = jQuery, module = $.fn.textext) ->
  { EventEmitter2, WatchJS, opts, prop } = module

  class Plugin extends EventEmitter2
    @registery = {}
    @register : (name, constructor) -> @registery[name] = constructor

    constructor : (@userOptions, @defaultOptions = {}) ->
      @plugins = []

    option : (key) -> opts(@userOptions, key) or opts(@defaultOptions, key)

    invalidate : ->
      plugin.invalidate() for plugin in @plugins

    addPlugin : (instance) ->
      instance.onAny => @emit instance.event, arguments
      @plugins.push instance

  module.Plugin = Plugin
