do (window, $ = jQuery, module = $.fn.textext) ->
  { EventEmitter2, WatchJS, opts, prop } = module

  class Plugin extends EventEmitter2
    @registery = {}
    @register : (name, constructor) -> @registery[name] = constructor

    constructor : ({ @element, @userOptions, @defaultOptions }) ->
      super()
      @plugins = []

    options : (key) ->
      user = opts(@userOptions, key)
      user = opts(@defaultOptions, key) if user is undefined
      user

    $ : (selector) -> @element.find selector

    # invalidate : ->
    #   plugin.invalidate() for plugin in @plugins

    broadcast : (name, plugin) ->
      handler = =>
        # turn current plugin event handler so that we don't stuck in emit loop
        plugin.offAny handler

        for child in @plugins
          child.emit "#{name}.#{plugin.event}", arguments if child isnt plugin

        @broadcast name, plugin

      plugin.onAny handler

    addPlugin : (name, plugin) ->
      @element.append plugin.element.addClass 'textext-plugin'
      @plugins.push plugin
      @broadcast name, plugin

  module.Plugin = Plugin
