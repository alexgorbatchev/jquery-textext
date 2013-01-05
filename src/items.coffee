do (window, $ = jQuery, module = $.fn.textext) ->
  { Plugin, nextTick } = module

  class Items extends Plugin
    @defaults =
      registery     : {}
      toStringField : null
      toValueField  : null

    @register : (name, constructor) -> @defaults.registery[name] = constructor
    @getRegistered : (name) -> @defaults.registery[name]
    @for : (plugin) ->
      name         = plugin.options 'manager'
      constructor  = @defaults.registery[name]
      instance     = new constructor parent : plugin, userOptions : plugin.options name
      plugin.items = instance

    constructor : (opts = {}) ->
      super opts, Items.defaults

      @init()

      @set @parent.options 'items' if @parent?

    set : (items, callback) ->
      nextTick =>
        @items = items
        callback and callback null, items
        @emit 'set', items

    add : (item, callback) ->
      nextTick =>
        @items.push item
        callback and callback null, item
        @emit 'add', item

    removeAt : (index, callback) ->
      nextTick =>
        item = @items[index]
        @items.splice index, 1
        callback and callback null, item
        @emit 'remove', index, item

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

  Items.register 'default', Items

  module.Items = Items
