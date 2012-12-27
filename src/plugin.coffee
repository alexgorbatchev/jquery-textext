do (window, $ = jQuery, module = $.fn.textext) ->
  { EventEmitter2, opts } = module

  class Plugin extends EventEmitter2
    @defaults =
      plugins   : ''
      registery : {}

    @register : (name, constructor) -> @defaults.registery[name] = constructor
    @getRegistered : (name) -> @defaults.registery[name]

    constructor : ({ @element, @userOptions, @defaultOptions }) ->
      super()
      @plugins = []

      @defaultOptions = $.extend true, {}, Plugin.defaults, @defaultOptions or {}

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

        # bubbles event up
        @emit.apply @, args

        # rebroadcasts events to siblings
        for key, child of @plugins
          child.emit.apply child, args if child isnt plugin

        plugin.onAny handler

      plugin.onAny handler

    init : ->
      @createPlugins @options 'plugins'

    createPlugins : (list) ->
      availablePlugins = @options 'registery'

      unless list.length is 0
        list = list.split /\s*,?\s+/g

        for name in list
          plugin = availablePlugins[name]
          instance = new plugin userOptions : @options name
          @addPlugin name, instance

    addPlugin : (name, plugin) ->
      @element.append plugin.element.addClass 'textext-plugin'
      @plugins.push plugin
      @broadcast name, plugin

  module.Plugin = Plugin
