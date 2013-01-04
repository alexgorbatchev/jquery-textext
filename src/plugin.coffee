do (window, $ = jQuery, module = $.fn.textext) ->
  { EventEmitter2, opts } = module

  class Plugin extends EventEmitter2
    @defaults =
      plugins   : ''
      registery : {}

    @register : (name, constructor) -> @defaults.registery[name] = constructor
    @getRegistered : (name) -> @defaults.registery[name]

    constructor : ({ @parent, @userOptions, @defaultOptions } = {}, pluginDefaults = {}) ->
      super wildcard : true

      @plugins        = null
      @defaultOptions = $.extend true, {}, Plugin.defaults, @defaultOptions or pluginDefaults

    options : (key) ->
      user = opts(@userOptions, key)
      user = opts(@defaultOptions, key) if user is undefined
      user

    handleEvents : (plugins = @plugins) ->
      handle = (plugin) =>
        handler = (args...) =>
          event = plugin.event
          args.unshift event

          # turn current plugin event handler so that we don't stuck in emit loop
          plugin.offAny handler

          # bubbles event up
          @emit.apply @, args

          # rebroadcasts events to siblings
          for key, child of @plugins
            child.emit.apply child, args if child isnt plugin

          plugin.onAny handler

        plugin.onAny handler

      handle plugin for name, plugin of plugins

    init : ->
      @plugins = @createPlugins @options 'plugins'
      @handleEvents @plugins

      @emit 'init.after'

    createPlugins : (list, registery) ->
      registery ?= @options 'registery'
      plugins   = {}

      unless list.length is 0
        list = list.split /\s*,?\s+/g

        for name in list
          constructor   = registery[name]
          plugins[name] = new constructor
            parent      : @
            userOptions : @options name

      plugins

    getPlugin : (name) -> @plugins[name]

  module.Plugin = Plugin
