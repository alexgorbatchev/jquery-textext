do (window, $ = jQuery, module = $.fn.textext) ->
  { Plugin, withDeferred, deferred, parallel, nextTick } = module

  class ItemsManager extends Plugin
    @defaults =
      registery     : {}
      toStringField : null
      toValueField  : null

      html :
        element : '<div class="textext-items-manager"/>'

    @register : (name, constructor) -> @defaults.registery[name] = constructor
    @getRegistered : (name) -> @defaults.registery[name]

    constructor : (opts = {}) ->
      super opts, ItemsManager.defaults
      @items = []

    set : (items) -> deferred (d) =>
      @items = items or []
      d.resolve()

    add : (item) -> deferred (d) =>
      @items.push item
      d.resolve()

    removeAt : (index) -> deferred (d) =>
      item = @items[index]
      @items.splice index, 1
      d.resolve(item)

    toString : (item) -> deferred (d) =>
      field  = @options 'toStringField'
      result = item
      result = result[field] if field and result
      d.resolve result

    toValue : (item) -> deferred (d) =>
      field  = @options 'toValueField'
      result = item
      result = result[field] if field and result
      d.resolve result

    fromString : (string) -> deferred (d) =>
      field  = @options 'toStringField'

      result = if field and result
        result = {}
        result[field] = string
      else
        string

      d.resolve result

    search : (query) -> deferred (d) =>
      results = []
      jobs    = []

      jobs.push @toString item for item in @items

      parallel(jobs).done (strings...) ->
        for string in strings
          results.push string if string.indexOf(query) is 0 or query is ''

        d.resolve results

    isValid : ->

  ItemsManager.register 'default', ItemsManager

  module.ItemsManager = ItemsManager
