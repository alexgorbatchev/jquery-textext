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

      @on 'keys.press.left'                  , @onLeftKey
      @on 'keys.press.right'                 , @onRightKey
      @on 'keys.press.backspace'             , @onBackspaceKey
      @on 'keys.press.' + @options('hotKey') , @onHotKey
      @on 'items.set'                        , @onItemsSet
      @on 'items.add'                        , @onItemAdded
      @on 'items.remove'                     , @onItemRemoved

      @element.on 'click', 'a', (e) => @onRemoveTagClick(e)

      @init()
      @appendToParent()

      @input = @getPlugin 'input'

    init : ->
      super()

      managers = @createPlugins @options('manager'), Items.defaults.registery
      @items = instance for name, instance of managers
      @handleEvents { @items }

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

    moveInputTo : (index, callback = ->) ->
      items = @$ '> .textext-tags-tag'

      if items.length
        if index < items.length
          @input.element.insertBefore items[index]
        else
          @input.element.insertAfter items.last()

      nextTick callback
      @emit 'tags.input.moved'

    onLeftKey : (keyCode, keyName) ->
      if @input.empty()
        @moveInputTo @inputPosition() - 1, => @input.focus()

    onItemsSet : (items) ->
      @element.find('.textext-tags-tag').remove()

      jobs = for item in items
        do (item) => (done) => @createItemElement item, done

      resistance.series jobs, (err, elements...) =>
        @element.append element for element in elements
        @moveInputTo Number.MAX_VALUE
        @emit 'tags.set', elements

    onItemAdded : (item) ->
      @createItemElement item, (err, element) =>
        unless err?
          @input.element.before element
          @emit 'tags.added', element

    onItemRemoved : (index, item) ->
      item = @$(".textext-tags-tag:eq(#{index})").remove()
      nextTick =>
        item.remove()
        @emit 'tags.removed', item

    onRightKey : (keyCode, keyName) ->
      if @input.empty()
        @moveInputTo @inputPosition() + 1, => @input.focus()

    onBackspaceKey : (keyCode, keyName) ->
      if @input.empty()
        @items.removeAt @inputPosition() - 1

    onHotKey : (keyCode, keyName) ->
      unless @input.empty()
        @items.fromString @input.value(), (err, item) =>
          unless err?
            @items.add item, (err, item) => @input.value ''

    onRemoveTagClick : (e) ->
      e.preventDefault()
      @items.removeAt @itemPosition(e.target)

  # add plugin to the registery so that it is usable by TextExt
  Plugin.register 'tags', TagsPlugin

  module.TagsPlugin = TagsPlugin
