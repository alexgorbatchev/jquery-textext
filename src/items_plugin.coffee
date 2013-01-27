do (window, $ = jQuery, module = $.fn.textext) ->
  { Plugin, ItemsManager, series, template, nextTick } = module

  class ItemsPlugin extends Plugin
    @defaults =
      manager : 'default'
      items : []

      html :
        items : '''
          <% for(var i = 0; i < items.length; i++) { %>
            <div class="textext-items-item">
              <script type="text/json"><%= items[i].json %></script>
              <span class="textext-items-label"><%= items[i].label %></span>
            </div>
          <% } %>
        '''

    constructor : (opts = {}, pluginDefaults = {}) ->
      super opts, $.extend(true, {}, ItemsPlugin.defaults, pluginDefaults)

      managers = @createPlugins @options('manager'), ItemsManager.defaults.registery
      @items = instance for name, instance of managers

      @setItems @options 'items'

    addItemElement : (element) -> @element.append element

    itemPosition : (element) ->
      element = $ element
      element = element.parents '.textext-items-item' unless element.is '.textext-items-item'
      @$('.textext-items-item').index element

    itemToObject : (item, callback = ->) ->
      @items.toString item, (err, value) =>
        callback err,
          json  : JSON.stringify item
          label : value

    displayItems : (items, callback = ->) ->
      @element.find('.textext-items-item').remove()

      jobs = for item in items
        do (item) => (next) => @itemToObject item, next

      series jobs, (err, items) =>
        template @options('html.items'), { items }, (err, html) =>
          @addItemElement $ html
          @emit event: 'items.display', done: callback

    setItems : (items, callback = ->) ->
      @items.set items, (err, items) =>
        @emit event: 'items.set', args: [ items ], done: (err) =>
          @displayItems items, callback

    addItem : (item, callback = ->) ->
      @items.add item, (err, item) =>
        @itemToObject item, (err, obj) =>
          template @options('html.items'), items: [ obj ], (err, html) =>
            @addItemElement $ html
            @emit event: 'items.add', done: callback

    removeItemAt : (index, callback = ->) ->
      @items.removeAt index, (err, item) =>
        element = @$(".textext-items-item:eq(#{index})")
        element.remove()

        @emit event: 'items.remove', args: [ element ], done: (err) =>
          callback err, element

  module.ItemsPlugin = ItemsPlugin
