do (window, $ = jQuery, module = $.fn.textext) ->
  { EventQueue, deferred, nextTick, opts } = module

  class Plugin
    @defaults =
      plugins   : ''
      registery : {}

      html :
        element : '<div/>'

    @register : (name, constructor) -> @defaults.registery[name] = constructor
    @getRegistered : (name) -> @defaults.registery[name]

    constructor : ({ @element, @queue, @parent, @userOptions, @defaultOptions } = {}, pluginDefaults = {}) ->
      @plugins        = null
      @queue          ?= new EventQueue
      @userOptions    ?= {}
      @defaultOptions ?= $.extend true, {}, Plugin.defaults, pluginDefaults

      @insureElement()
      @addToParent()

      @plugins = @createPlugins @options 'plugins'

    $ : (selector) -> @element.find selector
    visible: -> @element.is ':visible'
    getPlugin : (name) -> @plugins[name]

    on : (opts) ->
      opts.context ?= @
      @queue.on opts

    emit : (opts) ->
      opts.context ?= @
      @queue.emit opts

    options : (key) ->
      value = opts(@userOptions, key)
      value = opts(@defaultOptions, key) if typeof value is 'undefined'
      value

    insureElement : ->
      unless @element?
        html = @options 'html.element'
        @element = $ html if html?

      throw { name : 'Plugin', message : 'Needs element' } unless @element

      @element.addClass 'textext-plugin'

    addToParent : -> @parent?.element.append @element

    createPlugins : (list, registery) ->
      registery ?= @options 'registery'
      plugins   = {}

      create = (plugin) =>
        switch typeof plugin
          when 'string'
            return if plugin.length is 0
            name   = plugin
            plugin = registery[plugin]

          when 'function'
            name = plugin.pluginName
            throw name : 'Plugin', message : 'Expects plugin constructor to have `pluginName` property' unless name?

        plugins[name] = new plugin
          parent      : @
          queue       : @queue
          userOptions : @options name

      list = list.split /\s*,?\s+/g if typeof list is 'string'

      switch typeof list
        when 'object', 'array' then create plugin for plugin in list
        when 'function' then return create list

      plugins

  module.Plugin = Plugin
