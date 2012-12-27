do (window, $ = jQuery, module = $.fn.textext) ->
  { EventEmitter2, opts } = module

  class Plugin extends EventEmitter2
    @defaults =
      plugins   : ''
      registery : {}

    @register : (name, constructor) -> @defaults.registery[name] = constructor
    @getRegistered : (name) -> @defaults.registery[name]

    constructor : ({ @parent, @element, @userOptions, @defaultOptions }, pluginDefaults = {}) ->
      super wildcard : true

      @plugins        = {}
      @defaultOptions = $.extend true, {}, Plugin.defaults, @defaultOptions or pluginDefaults

    options : (key) ->
      user = opts(@userOptions, key)
      user = opts(@defaultOptions, key) if user is undefined
      user

    $ : (selector) -> @element.find selector

    broadcast : (plugin) ->
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

    init : ->
      @createPlugins @options 'plugins'

    createPlugins : (list) ->
      availablePlugins = @options 'registery'

      unless list.length is 0
        list = list.split /\s*,?\s+/g

        for name in list
          plugin = availablePlugins[name]

          @addPlugin name, new plugin
            parent      : @
            userOptions : @options name

    appendToParent : -> @parent.element.append @element

    addPlugin : (name, plugin) ->
      @plugins[name] = plugin
      @broadcast plugin

    getPlugin : (name) -> @plugins[name]

  module.Plugin = Plugin
