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
      instance       = new constructor parent : plugin, userOptions : plugin.options name
      plugin.manager = instance

    constructor : (opts = {}) ->
      super opts, ItemManager.defaults

      @init()

      @setItems @parent.options 'items' if @parent?

    setItems : (items, callback) ->
      nextTick =>
        @items = items
        callback and callback null, items
        @emit 'change.set', items

    addItem : (item, callback) ->
      nextTick =>
        @items.push item
        callback and callback null, item
        @emit 'change.add', item

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

        callback and callback null, result

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

        callback and callback null, result

    isValid : ->

  ItemManager.register 'default', ItemManager

  module.ItemManager = ItemManager
