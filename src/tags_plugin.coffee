do (window, $ = jQuery, module = $.fn.textext) ->
  { ItemsPlugin, Plugin, resistance, nextTick } = module

  class TagsPlugin extends ItemsPlugin
    @defaults =
      plugins    : 'input'
      items      : []
      hotKey     : 'enter'
      splitPaste : /\s*,\s*/g

      html :
        element : '<div class="textext-tags"/>'

        item : '''
          <div class="textext-items-item">
            <span class="textext-items-label"/>
            <a href="#">&times;</a>
          </div>
        '''

    constructor : (opts = {}) ->
      super opts, TagsPlugin.defaults
      @input = @getPlugin 'input'

      @on 'click', 'a', @onRemoveTagClick

      @on 'items.set'                        , @updateInputPosition
      @on 'keys.press.left'                  , @onLeftKey
      @on 'keys.press.right'                 , @onRightKey
      @on 'keys.press.backspace'             , @onBackspaceKey
      @on 'keys.press.' + @options('hotKey') , @onHotKey

    inputPosition : -> @$('> div').index @input.element

    updateInputPosition : (items) -> @moveInputTo Number.MAX_VALUE

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
        @items.removeAt index = @inputPosition() - 1, (err, item) => @removeItemAt index unless err?

    onHotKey : (keyCode, keyName) ->
      unless @input.empty()
        @items.fromString @input.value(), (err, item) =>
          unless err?
            @items.add item, (err, item) =>
              unless err?
                @input.value ''
                @addItem item

    onRemoveTagClick : (e) ->
      e.preventDefault()
      @items.removeAt index = @itemPosition(), (err, item) => @removeItemAt index unless err?

  # add plugin to the registery so that it is usable by TextExt
  Plugin.register 'tags', TagsPlugin

  module.TagsPlugin = TagsPlugin
