do (window, $ = jQuery, module = $.fn.textext) ->
  { UIPlugin, Plugin, Items, resistance, nextTick } = module

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

      Items.for @

      @items.on 'set', (items) => @onItemsSet items
      @items.on 'add', (item) => @onItemAdded item
      @items.on 'remove', (index, item) => @onItemRemoved index, item

    inputPosition : -> @$('> div').index @input.element

    itemPosition : (element) ->
      element = $ element
      element = element.parents '.textext-tags-tag' unless element.is '.textext-tags-tag'
      @$('.textext-tags-tag').index element

    createItemElement : (item, callback = ->) ->
      @items.toString item, (err, value) =>
        unless err?
          element = $ @options 'html.item'
          element.find('.textext-tags-label').html value

        callback err, element

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

    onItemsSet : (items, callback = ->) ->
      @element.find('.textext-tags-tag').remove()

      jobs = for item in items
        do (item) => (done) => @onItemAdded item, done

      resistance.series jobs, (err, elements...) =>
        @moveInputTo Number.MAX_VALUE, => callback err, elements

    onItemAdded : (item, callback = ->) ->
      @createItemElement item, (err, element) =>
        unless err?
          @input.element.before element
          @emit 'item.added', element

        callback err, element

    onItemRemoved : (index, item, callback) ->
      item = @$(".textext-tags-tag:eq(#{index})").remove()
      nextTick =>
        @emit 'item.removed', item
        callback and callback null, index, item

    onRightKey : (keyCode, keyName, callback = ->) ->
      if @input.empty()
        @moveInputTo @inputPosition() + 1, =>
          @input.focus()
          callback()
      else
        nextTick callback

    onBackspaceKey : (keyCode, keyName, callback = ->) ->
      if @input.empty()
        @items.removeAt @inputPosition() - 1, callback
      else
        nextTick callback

    onHotKey : (keyCode, keyName, callback = ->) ->
      unless @input.empty()
        item = @input.value()
        @items.add item, =>
          @input.value ''
          callback()
      else
        nextTick callback

    onRemoveTagClick : (e, callback = ->) ->
      e.preventDefault()
      @items.removeAt @itemPosition(e.target), callback

  # add plugin to the registery so that it is usable by TextExt
  Plugin.register 'tags', TagsPlugin

  module.TagsPlugin = TagsPlugin
