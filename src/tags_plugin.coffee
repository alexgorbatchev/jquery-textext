do (window, $ = jQuery, module = $.fn.textext) ->
  { ItemsPlugin, Plugin, resistance, nextTick } = module

  class TagsPlugin extends ItemsPlugin
    @defaults =
      plugins       : 'input'
      items         : []
      hotKey        : 'enter'
      inputMinWidth : 50
      splitPaste    : /\s*,\s*/g

      html :
        element : '<div class="textext-tags"/>'

        item : '''
          <div class="textext-items-item">
            <span class="textext-items-label"/>
            <a href="#"></a>
          </div>
        '''

    constructor : (opts = {}) ->
      super opts, TagsPlugin.defaults
      @input = @getPlugin 'input'

      @element.on 'click', 'a', @$onRemoveTagClick

      @on @,
        'keys.down.left'      : @onLeftKey
        'keys.down.right'     : @onRightKey
        'keys.down.backspace' : @onBackspaceKey
        # 'items.set'           : @updateInputPosition
        'items.display'       : @invalidateInputBox
        'items.add'           : @invalidateInputBox
        'items.remove'        : @invalidateInputBox
        'items.set'           : @invalidateInputBox

      @on @, 'keys.down.' + @options('hotKey'), @onHotKey

    inputPosition : -> @$('> div').index @input.element

    updateInputPosition : (items) -> @moveInputTo Number.MAX_VALUE

    addItemElement : (element) -> @input.element.before element

    invalidateInputBox : (args..., next) ->
      elements     = @$ '> .textext-items-item, > .textext-input'
      input        = elements.filter '.textext-input'
      parent       = @parent.element
      paddingLeft  = parseFloat parent.css 'paddingLeft'
      paddingRight = parseFloat parent.css 'paddingRight'
      maxWidth     = parent.innerWidth() - paddingLeft - paddingRight

      avgWidth = =>
        width = 0
        list  = @$('> .textext-items-item')
        list.each -> width += $(@).outerWidth(true)
        width / list.length

      width = if elements.length is 1
        maxWidth
      else if elements.first().is input
        avgWidth()
      else if elements.last().is input
        prev     = input.prev('.textext-items-item')
        minWidth = @options 'inputMinWidth'
        width    = maxWidth - prev.offset().left - prev.outerWidth(true)
        if width < minWidth then maxWidth else width
      else
        avgWidth()

      input.width width
      next()

    moveInputTo : (index, callback = ->) ->
      items = @$ '> .textext-items-item'

      if items.length
        if index < items.length
          @input.element.insertBefore(items[index])
        else
          @input.element.insertAfter items.last()

        @invalidateInputBox callback
      else
        nextTick callback

    onLeftKey : (keyCode, next) ->
      if @input.empty()
        @moveInputTo @inputPosition() - 1, =>
          @input.focus()
          next()
      else
        next()

    onRightKey : (keyCode, next) ->
      if @input.empty()
        @moveInputTo @inputPosition() + 1, =>
          @input.focus()
          next()
      else
        next()

    onBackspaceKey : (keyCode, next) ->
      if @input.empty()
        @items.removeAt index = @inputPosition() - 1, (err, item) =>
          @removeItemAt index, next
      else
        next()

    onHotKey : (keyCode, next) ->
      unless @input.empty()
        @items.fromString @input.value(), (err, item) =>
          @items.add item, (err, item) =>
            @input.value ''
            @addItem item, next
      else
        next()

    $onRemoveTagClick : (e) =>
      e.preventDefault()
      @items.removeAt index = @itemPosition(e.target), (err, item) => @removeItemAt index unless err?

  # add plugin to the registery so that it is usable by TextExt
  Plugin.register 'tags', TagsPlugin

  module.TagsPlugin = TagsPlugin
