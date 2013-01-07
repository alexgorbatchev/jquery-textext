do (window, $ = jQuery, module = $.fn.textext) ->
  { Plugin, resistance, nextTick } = module

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

      # @items = []
      @set @parent.options 'items' if @parent?

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

    search : (query, callback) ->
      nextTick =>
        results = []
        jobs = []

        for item in @items
          do (item) =>
            jobs.push (done) =>
              @toString item, (err, string) =>
                if string.indexOf(query) is 0
                  results.push item

                done err, string

        resistance.series jobs, (err) -> callback err, results

    isValid : ->

  ItemsManager.register 'default', ItemsManager

  module.ItemsManager = ItemsManager
