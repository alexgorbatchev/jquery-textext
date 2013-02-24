do (window, $ = jQuery, module = $.fn.textext) ->
  { Plugin, withDeferred, deferred, series } = module

  class ItemsManager extends Plugin
    @pluginName = 'itemsManager'

    @defaults =
      toStringField : null
      toValueField  : null
      sortResults   : true

      html :
        element : '<div class="textext-items-manager"/>'

    constructor : (opts = {}) ->
      super opts, ItemsManager.defaults
      @items = []

    set : (items) -> deferred (resolve, reject) =>
      @items = items or []
      resolve()

    add : (item) -> deferred (resolve, reject) =>
      @items.push item
      resolve()

    removeAt : (index) -> deferred (resolve, reject) =>
      item = @items[index]
      @items.splice index, 1
      resolve item

    toString : (item) -> deferred (resolve, reject) =>
      return resolve null, null unless item?

      field  = @options 'toStringField'
      result = item
      result = result[field] if field and result
      resolve result, item

    toValue : (item) -> deferred (resolve, reject) =>
      field  = @options 'toValueField'
      result = item
      result = result[field] if field and result
      resolve result, item

    fromString : (string) -> deferred (resolve, reject) =>
      field = @options 'toStringField'

      if field and string
        result = {}
        result[field] = string
      else
        result = string

      resolve result, string

    search : (query) -> deferred (resolve, reject) =>
      results = []
      jobs    = []

      jobs.push @toString(item) for item in @items

      series(jobs).fail(reject).done (items...) ->
        for [ string, item ] in items
          results.push item if string.indexOf(query) is 0 or query is ''

        resolve results

  module.ItemsManager = ItemsManager
