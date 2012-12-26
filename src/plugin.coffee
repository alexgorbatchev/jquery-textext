do (window, $ = jQuery, module = $.fn.textext) ->
  { EventEmitter2, opts } = module

  class Plugin extends EventEmitter2
    @defaults =
      plugins :
        user      : ''
        init      : ''
        registery : {}

    @register : (name, constructor) -> @defaults.plugins.registery[name] = constructor
    @getRegistered : (name) -> @defaults.plugins.registery[name]

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

        for child in @plugins
          child.emit "#{name}.#{plugin.event}", arguments if child isnt plugin

        @broadcast name, plugin

      plugin.onAny handler

    init : ->
      @createPlugins @options('plugins.init')
      @createPlugins @options('plugins.user')

    createPlugins : (list) ->
      availablePlugins = @options 'plugins.registery'

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
