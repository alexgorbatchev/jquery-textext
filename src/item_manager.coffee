do (window, $ = jQuery, module = $.fn.textext) ->
  { Plugin, nextTick } = module

  class ItemManager extends Plugin
    @defaults =
      registery     : {}
      toStringField : null
      toValueField  : null

    @register : (name, constructor) -> @defaults.registery[name] = constructor
    @getRegistered : (name) -> @defaults.registery[name]
    @createFor : (plugin) ->
      name           = plugin.options 'manager'
      constructor    = @defaults.registery[name]
      instance       = new constructor userOptions : plugin.options name
      plugin.manager = instance

    constructor : (opts = {}) ->
      super opts, ItemManager.defaults

      @items = []

      @init()

    getItems : (callback) ->
      nextTick =>
        @items = @parent.options 'items'
        callback null, @items

    setItems : (items, callback) ->
      nextTick =>
        @items = items
        callback null, items

    addItem : (item, callback) ->
      nextTick =>
        @items.push item
        callback null, item

    itemToString : (item, callback) ->
      nextTick =>
        field  = @options 'toStringField'
        result = item
        result = result[field] if field and result

        callback null, result

    itemToValue : (item, callback) ->
      nextTick =>
        field  = @options 'toValueField'
        result = item
        result = result[field] if field and result

        callback null, result

    stringToItem : (value, callback) ->
      nextTick =>
        field  = @options 'toStringField'
        result = null

        for item in @items
          compare = item
          compare = compare[field] if field and compare

          if compare is value
            result = item
            break

        return callback null, result

    isValid : ->

  ItemManager.register 'default', ItemManager

  module.ItemManager = ItemManager
