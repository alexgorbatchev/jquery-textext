do (window, $ = jQuery, module = $.fn.textext) ->
  { Plugin, ItemsManager, deferred, parallel, template } = module

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

    addItemElements : (elements) -> @element.append elements
    clearItems: -> @$('.textext-items-item').remove()

    selectedIndex : ->
      items    = @$ '.textext-items-item'
      selected = items.filter '.textext-items-selected'

      items.index selected

    selectedItem : -> @$ '.textext-items-selected'

    select : (index) ->
      items   = @$('.textext-items-item')
      newItem = items.eq index

      if newItem.length
        items.removeClass 'textext-items-selected'
        newItem.addClass 'textext-items-selected' if index >= 0

    defaultItems: -> deferred (d) =>
      items = @options 'items'

      if items? and items.length
        @setItems(items).done -> d.resolve()
      else
        d.resolve()

    itemData: (element) ->
      data = element.data 'json'

      unless data?
        html = element.find('script[type="text/json"]').html()

        if html?
          data = JSON.parse html
          element.data 'json', data

      data

    itemIndex : (element) ->
      element = $ element
      element = element.parents '.textext-items-item' unless element.is '.textext-items-item'
      @$('.textext-items-item').index element

    itemToObject : (item) ->
      @items.toString(item).pipe (value) ->
        json  : JSON.stringify item
        label : value

    displayItems : (items) -> deferred (d) =>
      @element.find('.textext-items-item').remove()

      jobs = []
      jobs.push @itemToObject item for item in items

      parallel(jobs).done (items...) =>
        template(@options('html.items'), { items }).done (html) =>
          @clearItems()
          @addItemElements $ html
          @emit(event: 'items.display').done ->
            d.resolve()

    setItems : (items) -> deferred (d) =>
      @items.set(items).done =>
        @emit(event: 'items.set', args: [ items ]).done =>
          @displayItems(items).done ->
            d.resolve()

    addItem : (item) -> deferred (d) =>
      @items.add(item).done =>
        @itemToObject(item).done (obj) =>
          template(@options('html.items'), items: [ obj ]).done (html) =>
            @addItemElements $ html
            @emit(event: 'items.add').done ->
              d.resolve()

    removeItemAt : (index) -> deferred (d) =>
      @items.removeAt(index).done (item) =>
        element = @$(".textext-items-item:eq(#{index})")
        element.remove()
        @emit(event: 'items.remove', args: [ element ]).done ->
          d.resolve(item)

  module.ItemsPlugin = ItemsPlugin
