do (window, $ = jQuery, module = $.fn.textext) ->
  { EventEmitter2, WatchJS, opts, prop } = module

  class Plugin extends EventEmitter2
    @registery = {}
    @register : (name, constructor) -> @registery[name] = constructor

    constructor : ({ @element, @userOptions, @defaultOptions } = {}) ->
      super()
      @plugins = []

    options : (key) -> opts(@userOptions, key) or opts(@defaultOptions, key)

    $ : (selector) -> @element.find selector

    # invalidate : ->
    #   plugin.invalidate() for plugin in @plugins

    addPlugin : (instance) ->
      @element.append instance.element.addClass 'textext-plugin'
      instance.onAny => @emit instance.event, arguments
      @plugins.push instance

  module.Plugin = Plugin
