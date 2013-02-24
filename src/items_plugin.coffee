do (window, $ = jQuery, module = $.fn.textext) ->
  { Plugin, ItemsManager, deferred, series, parallel, template, equals } = module

  class ItemsPlugin extends Plugin
    @defaults =
      manager : ItemsManager
      items   : []

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

      @items = @createPlugins @options('manager')

    getElements     : -> @$ '> .textext-items-item'
    clearElements   : -> @getElements().remove()
    addItemElements : (elements) -> @element.append elements

    hasItem : (item) ->
      elements = @getElements()

      for element in elements
        data = @itemData $ element
        return true if equals item, data

      return false

    selectedIndex : ->
      elements = @getElements()
      selected = elements.filter '.textext-items-selected'
      elements.index selected

    selectedItem : ->
      element = @$ '.textext-items-selected'
      if element.length then element else null

    select : (index) ->
      elements = @getElements()
      elementToSelect = elements.eq index

      if elementToSelect.length
        elements.removeClass 'textext-items-selected'
        elementToSelect.addClass 'textext-items-selected' if index >= 0

    itemData : (element) ->
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

    defaultItems : -> deferred (resolve, reject) =>
      items = @options 'items'

      if items? and items.length
        @setItems(items).then resolve, reject
      else
        reject()

    displayItems : (items) -> deferred (resolve, reject) =>
      jobs = []
      jobs.push @itemToObject item for item in items

      parallel(jobs).fail(reject).done (items...) =>
        template(@options('html.items'), { items }).fail(reject).done (html) =>
          @clearElements()
          @addItemElements $ html
          @emit(event: 'items.display').then resolve, reject

    setItems : (items) -> deferred (resolve, reject) =>
      series(
        @items.set(items)
        @emit(event: 'items.set', args: [ items ])
        @displayItems(items)
      ).then resolve, reject

    addItem : (item) -> deferred (resolve, reject) =>
      @items.add(item).fail(reject).done =>
        @itemToObject(item).fail(reject).done (obj) =>
          template(@options('html.items'), items: [ obj ]).fail(reject).done (html) =>
            @addItemElements $ html
            @emit(event: 'items.add').then resolve, reject

    removeItemAt : (index) -> deferred (resolve, reject) =>
      @items.removeAt(index).fail(reject).done (item) =>
        element = @$(".textext-items-item:eq(#{index})")
        element.remove()
        @emit(event: 'items.remove', args: [ element ]).then resolve, reject

  module.ItemsPlugin = ItemsPlugin
