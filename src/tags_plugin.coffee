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

      @on 'click', 'a', @onRemoveTagClick
      @on 'items:set', @updateInputPosition
      @on 'keys:press:left', @onLeftKey
      @on 'keys:press:right', @onRightKey
      @on 'keys:press:backspace', @onBackspaceKey
      @on 'keys:press:' + @options('hotKey') , @onHotKey
      @on 'items:display', @invalidateInputBox
      @on 'items:add', @invalidateInputBox
      @on 'items:remove', @invalidateInputBox
      @on 'items:set', @invalidateInputBox

    inputPosition : -> @$('> div').index @input.element

    updateInputPosition : (items) -> @moveInputTo Number.MAX_VALUE

    addItemElement : (element) -> @input.element.before element

    invalidateInputBox : ->
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

    moveInputTo : (index, callback = ->) ->
      items = @$ '> .textext-items-item'

      if items.length
        if index < items.length
          @input.element.insertBefore(items[index])
        else
          @input.element.insertAfter items.last()

        @invalidateInputBox()

      nextTick callback

    onLeftKey : ->
      if @input.empty()
        @moveInputTo @inputPosition() - 1, => @input.focus()

    onRightKey : ->
      if @input.empty()
        @moveInputTo @inputPosition() + 1, => @input.focus()

    onBackspaceKey : ->
      if @input.empty()
        @items.removeAt index = @inputPosition() - 1, (err, item) => @removeItemAt index unless err?

    onHotKey : ->
      unless @input.empty()
        @items.fromString @input.value(), (err, item) =>
          unless err?
            @items.add item, (err, item) =>
              unless err?
                @input.value ''
                @addItem item

    onRemoveTagClick : (e) ->
      e.preventDefault()
      @items.removeAt index = @itemPosition(e.target), (err, item) => @removeItemAt index unless err?

  # add plugin to the registery so that it is usable by TextExt
  Plugin.register 'tags', TagsPlugin

  module.TagsPlugin = TagsPlugin
