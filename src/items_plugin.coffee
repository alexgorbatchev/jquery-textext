do (window, $ = jQuery, module = $.fn.textext) ->
  { Plugin, ItemsManager, resistance, nextTick } = module

  class ItemsPlugin extends Plugin
    @defaults =
      manager : 'default'
      items : []

      html :
        item : '''
          <div class="textext-items-item">
            <span class="textext-items-label"/>
          </div>
        '''

    constructor : (opts = {}, pluginDefaults = {}) ->
      super opts, $.extend({}, ItemsPlugin.defaults, pluginDefaults)

      managers = @createPlugins @options('manager'), ItemsManager.defaults.registery
      @items = instance for name, instance of managers

      @setItems @options 'items'

    addItemElement : (element) -> @element.append element

    itemPosition : (element) ->
      element = $ element
      element = element.parents '.textext-items-item' unless element.is '.textext-items-item'
      @$('.textext-items-item').index element

    createItemElement : (item, callback = ->) ->
      @items.toString item, (err, value) =>
        element = $ @options 'html.item'
        element.data 'item', item
        element.find('.textext-items-label').html value

        callback err, element

    displayItems : (items, callback = ->) ->
      @element.find('.textext-items-item').remove()

      jobs = for item in items
        do (item) => (done) => @createItemElement item, done

      resistance.series jobs, (err, elements...) =>
        @addItemElement element for element in elements

        @emit 'items.display', [ elements ], (err) =>
          callback err, elements

    setItems : (items, callback = ->) ->
      @items.set items, (err, items) =>
        @emit 'items.set', [ items ], (err) =>
          @displayItems items, callback

    addItem : (item, callback = ->) ->
      @items.add item, (err, item) =>
        @createItemElement item, (err, element) =>
          @addItemElement element

          @emit 'items.add', [ element ], (err) =>
            callback err, element

    removeItemAt : (index, callback = ->) ->
      @items.removeAt index, (err, item) =>
        element = @$(".textext-items-item:eq(#{index})")
        element.remove()

        @emit 'items.remove', [ element ], (err) =>
          callback err, element

  module.ItemsPlugin = ItemsPlugin
