do (window, $ = jQuery, module = $.fn.textext) ->
  { EventQueue, opts } = module

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
    on : (args...) -> @queue.on.apply @queue, args
    emit : (args...) -> @queue.emit.apply @queue, args
    getPlugin : (name) -> @plugins[name]

    options : (key) ->
      value = opts(@userOptions, key)
      value = opts(@defaultOptions, key) if value is undefined
      value

    insureElement : ->
      unless @element?
        html = @options 'html.element'
        @element = $ html if html?

      throw { name : 'Plugin', message : 'Needs element' } unless @element

      @element.addClass 'textext-plugin'

    addToParent : -> @parent?.element.append @element

    createPlugins : (list = '', registery) ->
      registery ?= @options 'registery'
      plugins   = {}

      unless list.length is 0
        list = list.split /\s*,?\s+/g

        for name in list
          constructor = registery[name]
          instance    = new constructor
            parent      : @
            queue       : @queue
            userOptions : @options name

          plugins[name] = instance

      plugins

  module.Plugin = Plugin
