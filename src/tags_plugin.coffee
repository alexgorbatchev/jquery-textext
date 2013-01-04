do (window, $ = jQuery, module = $.fn.textext) ->
  { UIPlugin, Plugin, ItemManager, resistance, nextTick } = module

  class TagsPlugin extends UIPlugin
    @defaults =
      plugins    : 'input'
      manager    : 'default'
      items      : []
      hotKey     : 'enter'
      splitPaste : /\s*,\s*/g

      html :
        container : '<div class="textext-tags"/>'

        item : '''
          <div class="textext-tags-tag">
            <span class="textext-tags-label"/>
            <a href="#">&times;</a>
          </div>
        '''

    constructor : (opts = {}) ->
      super opts, TagsPlugin.defaults

      @element ?= $ @options 'html.container'

      @on 'keys.press.left'                 , @onLeftKey
      @on 'keys.press.right'                , @onRightKey
      @on 'keys.press.backspace'            , @onBackspaceKey
      @on "keys.press.#{@options 'hotKey'}" , @onHotKey

      @element.on 'click', 'a', (e) => @onRemoveTagClick(e)

      @init()
      @appendToParent()

      @input = @getPlugin 'input'

    init : ->
      super()
      ItemManager.createFor @

    setItems : (items, callback) ->
      @manager.setItems items, (err, items) =>
        return callback err if err?

        @element.find('.textext-tags-tag').remove()

        jobs = for item in items
          do (item) => (done) => @createItemElement item, done

        resistance.series jobs, (err, elements...) =>
          @element.append element for element in elements
          @moveInputTo Number.MAX_VALUE, =>
            callback null, elements

    addItem : (item, callback) ->
      @manager.addItem item, (err, item) =>
        @createItemElement item, (err, element) =>
          unless err?
            @input.element.before element
            @emit 'item.added', element

          callback err, element

    inputPosition : -> @$('> div').index @input.element

    itemPosition : (element) ->
      element = $ element
      element = element.parents '.textext-tags-tag' unless element.is '.textext-tags-tag'
      @$('.textext-tags-tag').index element

    removeItemByIndex : (index, callback) ->
      # TODO hook up item manager

      item = @$(".textext-tags-tag:eq(#{index})").remove()
      nextTick =>
        @emit 'item.removed', item
        callback null, item

    createItemElement : (item, callback) ->
      element = $ @options 'html.item'
      # TODO use manager
      element.find('.textext-tags-label').html item
      nextTick -> callback null, element

    moveInputTo : (index, callback) ->
      items = @$ '> .textext-tags-tag'

      if items.length
        if index < items.length
          @input.element.insertBefore items[index]
        else
          @input.element.insertAfter items.last()

      nextTick callback

    onLeftKey : (keyCode, keyName, callback = ->) ->
      if @input.empty()
        @moveInputTo @inputPosition() - 1, =>
          @input.focus()
          callback()
      else
        nextTick callback

    onRightKey : (keyCode, keyName, callback = ->) ->
      if @input.empty()
        @moveInputTo @inputPosition() + 1, =>
          @input.focus()
          callback()
      else
        nextTick callback

    onBackspaceKey : (keyCode, keyName, callback = ->) ->
      if @input.empty()
        @removeItemByIndex @inputPosition() - 1, =>
          callback()
      else
        nextTick callback

    onHotKey : (keyCode, keyName, callback = ->) ->
      # TODO use manager
      unless @input.empty()
        item = @input.value()
        @addItem item, =>
          @input.value ''
          callback()
      else
        nextTick callback

    onRemoveTagClick : (e, callback = ->) ->
      e.preventDefault()
      @removeItemByIndex @itemPosition(e.target), callback

  # add plugin to the registery so that it is usable by TextExt
  Plugin.register 'tags', TagsPlugin

  module.TagsPlugin = TagsPlugin
