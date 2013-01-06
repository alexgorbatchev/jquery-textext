do (window, $ = jQuery, module = $.fn.textext) ->
  { Plugin, nextTick } = module

  class ItemsManager extends Plugin
    @defaults =
      registery     : {}
      toStringField : null
      toValueField  : null

    @register : (name, constructor) -> @defaults.registery[name] = constructor
    @getRegistered : (name) -> @defaults.registery[name]

    constructor : (opts = {}) ->
      super opts, ItemsManager.defaults

      @init()

      @items = []
      # @set @parent.options 'items' if @parent?

    set : (items, callback) ->
      nextTick =>
        @items = items or []
        @emit 'itemsmanager.set', items
        callback and callback null, items

    add : (item, callback) ->
      nextTick =>
        @items.push item
        @emit 'itemsmanager.add', item
        callback and callback null, item

    removeAt : (index, callback) ->
      nextTick =>
        item = @items[index]
        @items.splice index, 1
        @emit 'itemsmanager.remove', index, item
        callback and callback null, index, item

    toString : (item, callback) ->
      nextTick =>
        field  = @options 'toStringField'
        result = item
        result = result[field] if field and result

        callback null, result

    toValue : (item, callback) ->
      nextTick =>
        field  = @options 'toValueField'
        result = item
        result = result[field] if field and result

        callback and callback null, result

    fromString : (string, callback) ->
      nextTick =>
        field  = @options 'toStringField'

        result = if field and result
          result = {}
          result[field] = string
        else
          string

        callback null, result

    find : (value, callback) ->
      nextTick =>
        field  = @options 'toStringField'
        result = null

        for item in @items
          compare = item
          compare = compare[field] if field and compare

          if compare is value
            result = item
            break

        callback and callback null, result

    isValid : ->

  ItemsManager.register 'default', ItemsManager

  module.ItemsManager = ItemsManager
