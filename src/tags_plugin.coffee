do (window, $ = jQuery, module = $.fn.textext) ->
  { ItemsPlugin, Plugin, deferred, series, nextTick } = module

  NAME = 'TagsPlugin'

  class TagsPlugin extends ItemsPlugin
    @defaults =
      plugins         : 'input'
      items           : []
      inputMinWidth   : 50
      allowDuplicates : false
      check           : /^.+$/
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

      @input.on
        context : @
        events  :
          'input.complete'          : @complete
          'input.keydown.left'      : @onLeftKey
          'input.keydown.right'     : @onRightKey
          'input.keydown.backspace' : @onBackspaceKey

      @on events:
        'items.set' : @updateInputPosition

      @defaultItems()

    complete : -> deferred (resolve, reject) =>
      allowDuplicates = @options 'allowDuplicates'
      check           = @options 'check'
      value           = @input.value()

      return reject(name : NAME, message : 'Value did not pass check') unless check.test value

      @items.fromString(value).fail(reject).done (item) =>
        return reject() if not allowDuplicates and @hasItem item

        @items.add(item).fail(reject).done =>
          @input.value ''
          @addItem(item).then resolve, reject

    inputIndex : -> @$('> div').index @input.element

    updateInputPosition : -> @moveInputTo Number.MAX_VALUE

    addItemElements : (elements) -> @input.element.before elements

    moveInputTo : (index) -> deferred (resolve, reject) =>
      items = @$ '> .textext-items-item'

      if items.length
        if index < items.length
          @input.element.insertBefore(items[index])
        else
          @input.element.insertAfter items.last()

      resolve()

    onLeftKey : (keyCode) -> deferred (resolve, reject) =>
      if @input.empty()
        @moveInputTo(@inputIndex() - 1).fail(reject).done =>
          @input.focus()
          resolve()
      else
        reject()

    onRightKey : (keyCode) -> deferred (resolve, reject) =>
      if @input.empty()
        @moveInputTo(@inputIndex() + 1).fail(reject).done =>
          @input.focus()
          resolve()
      else
        reject()

    onBackspaceKey : (keyCode) -> deferred (resolve, reject) =>
      if @input.empty()
        @backspaces++

        if @backspaces is 2
          @backspaces = 0
          index = @inputIndex() - 1
          return series(@items.removeAt(index), @removeItemAt(index)).then resolve, reject
      else
        @backspaces = 0

      resolve()

    $onRemoveTagClick : (e) =>
      e.preventDefault()
      index = @itemIndex(e.target)
      series(@items.removeAt(index), @removeItemAt(index))

  # add plugin to the registery so that it is usable by TextExt
  Plugin.register 'tags', TagsPlugin

  module.TagsPlugin = TagsPlugin
