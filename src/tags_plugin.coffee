do (window, $ = jQuery, module = $.fn.textext) ->
  { ItemsUIPlugin, Plugin, resistance, nextTick } = module

  class TagsPlugin extends ItemsUIPlugin
    @defaults =
      plugins    : 'input'
      items      : []
      hotKey     : 'enter'
      splitPaste : /\s*,\s*/g

      html :
        container : '<div class="textext-tags"/>'

        item : '''
          <div class="textext-items-item">
            <span class="textext-items-label"/>
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
      @on 'items.set'                        , @updateInputPosition

      @element.on 'click', 'a', (e) => @onRemoveTagClick(e)

      @init()
      @appendToParent()

      @input = @getPlugin 'input'

    inputPosition : -> @$('> div').index @input.element

    updateInputPosition : -> @moveInputTo Number.MAX_VALUE

    addItemElement : (element) -> @input.element.before element

    moveInputTo : (index, callback = ->) ->
      items = @$ '> .textext-items-item'

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
