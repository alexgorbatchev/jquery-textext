do (window, $ = jQuery, module = $.fn.textext) ->
  { UIPlugin, ItemsManager, resistance, nextTick } = module

  class ItemsUIPlugin extends UIPlugin
    @defaults =
      manager : 'default'

      html :
        item : '''
          <div class="textext-items-item">
            <span class="textext-items-label"/>
          </div>
        '''

    constructor : (opts = {}, pluginDefaults = {}) ->
      super opts, $.extend({}, ItemsUIPlugin.defaults, pluginDefaults)

      @on 'itemsmanager.set'    , @onItemsSet
      @on 'itemsmanager.add'    , @onItemAdded
      @on 'itemsmanager.remove' , @onItemRemoved

      managers = @createPlugins @options('manager'), ItemsManager.defaults.registery
      @items = instance for name, instance of managers
      @handleEvents { @items }

      @items.set @options 'items'

    addItemElement : (element) -> @element.append element

    itemPosition : (element) ->
      element = $ element
      element = element.parents '.textext-items-item' unless element.is '.textext-items-item'
      @$('.textext-items-item').index element

    createItemElement : (item, callback = ->) ->
      @items.toString item, (err, value) =>
        unless err?
          element = $ @options 'html.item'
          element.find('.textext-items-label').html value

        callback err, element

    onItemsSet : (items) ->
      @element.find('.textext-items-item').remove()

      return unless items?

      jobs = for item in items
        do (item) => (done) => @createItemElement item, done

      resistance.series jobs, (err, elements...) =>
        @addItemElement element for element in elements
        @emit 'items.set', elements

    onItemAdded : (item) ->
      @createItemElement item, (err, element) =>
        unless err?
          @addItemElement element
          @emit 'items.added', element

    onItemRemoved : (index, item) ->
      item = @$(".textext-items-item:eq(#{index})").remove()
      nextTick =>
        item.remove()
        @emit 'items.removed', item

  module.ItemsUIPlugin = ItemsUIPlugin
