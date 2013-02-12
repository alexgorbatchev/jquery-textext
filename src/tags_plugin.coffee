do (window, $ = jQuery, module = $.fn.textext) ->
  { ItemsPlugin, Plugin, deferred, series, nextTick } = module

  class TagsPlugin extends ItemsPlugin
    @defaults =
      plugins       : 'input'
      items         : []
      hotKey        : 'enter'
      inputMinWidth : 50
      # splitPaste    : /\s*,\s*/g

      html :
        element : '<div class="textext-tags"/>'

        items : '''
          <% for(var i = 0; i < items.length; i++) { %>
            <div class="textext-items-item">
              <script type="text/json"><%= items[i].json %></script>
              <span class="textext-items-label"><%= items[i].label %></span>
              <a href="#"></a>
            </div>
          <% } %>
        '''

    constructor : (opts = {}) ->
      super opts, TagsPlugin.defaults

      @input      = @getPlugin 'input'
      @backspaces = 0

      @element.on 'click', 'a', @$onRemoveTagClick

      @on events:
        'keys.down.left'      : @onLeftKey
        'keys.down.right'     : @onRightKey
        'keys.down.backspace' : @onBackspaceKey
        'items.set'           : @updateInputPosition

      @on event: 'keys.down.' + @options('hotKey'), handler: @onHotKey

      @defaultItems()

    inputPosition : -> @$('> div').index @input.element

    updateInputPosition : -> @moveInputTo Number.MAX_VALUE

    addItemElements : (elements) -> @input.element.before elements

    moveInputTo : (index) -> deferred (d) =>
      items = @$ '> .textext-items-item'

      if items.length
        if index < items.length
          @input.element.insertBefore(items[index])
        else
          @input.element.insertAfter items.last()

      d.resolve()

    onLeftKey : (keyCode) -> deferred (d) =>
      if @input.empty()
        @moveInputTo(@inputPosition() - 1).done =>
          @input.focus()
          d.resolve()
      else
        d.resolve()

    onRightKey : (keyCode) -> deferred (d) =>
      if @input.empty()
        @moveInputTo(@inputPosition() + 1).done =>
          @input.focus()
          d.resolve()
      else
        d.resolve()

    onBackspaceKey : (keyCode) -> deferred (d) =>
      if @input.empty()
        @backspaces++

        if @backspaces is 2
          @backspaces = 0
          index = @inputPosition() - 1
          return series(@items.removeAt(index), @removeItemAt(index)).done -> d.resolve()
      else
        @backspaces = 0

      d.resolve()

    onHotKey : (keyCode) -> deferred (d) =>
      unless @input.empty()
        @items.fromString(@input.value()).done (item) =>
          @items.add(item).done =>
            @input.value ''
            @addItem(item).done ->
              d.resolve()
      else
        d.resolve()

    $onRemoveTagClick : (e) =>
      e.preventDefault()
      index = @itemPosition(e.target)
      series(@items.removeAt(index), @removeItemAt(index))

  # add plugin to the registery so that it is usable by TextExt
  Plugin.register 'tags', TagsPlugin

  module.TagsPlugin = TagsPlugin
