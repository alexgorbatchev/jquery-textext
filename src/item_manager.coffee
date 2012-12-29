do (window, $ = jQuery, module = $.fn.textext) ->
  { Plugin, nextTick } = module

  class ItemManager extends Plugin
    @defaults =
      toStringField : null

    constructor : (opts = {}) ->
      super opts, ItemManager.defaults

      @init()

    getItems : (opts, callback) ->
      nextTick =>
        callback null, @parent.options 'items'

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

    stringToItem : (value, items, callback) ->
      nextTick =>
        field  = @options 'toStringField'
        result = null

        for item in items
          compare = item
          compare = compare[field] if field and compare

          if compare is value
            result = item
            break

        return callback null, result

    isValid : ->

  # add plugin to the registery so that it is usable by TextExt
  Plugin.register 'item_manager', ItemManager

  module.ItemManager = ItemManager
