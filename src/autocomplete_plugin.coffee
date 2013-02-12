do (window, $ = jQuery, module = $.fn.textext) ->
  { ItemsPlugin, InputPlugin, Plugin, deferred, series, throttle, template } = module

  class AutocompletePlugin extends ItemsPlugin
    @defaults =
      items            : []
      minLength        : 1
      keyThrottleDelay : 500
      hotKey           : 'enter'
      noResults        : 'No matching items...'

      html :
        element : '<div class="textext-autocomplete"/>'

        item : '''
          <div class="textext-items-item">
            <span class="textext-items-label"><%= label %></span>
          </div>
        '''

        noResults : '''
          <div class="textext-autocomplete-no-results">
            <span class="textext-items-label"><%= label %></span>
          </div>
        '''

    constructor : (opts = {}) ->
      super opts, AutocompletePlugin.defaults

      if @parent? and not (@parent instanceof InputPlugin)
        throw name : 'AutocompletePlugin', message : 'Expects InputPlugin parent'

      @parent.on
        context : @
        events  :
          'input.change'    : throttle @onInputChange, @, @options 'keyThrottleDelay'
          'keys.down.up'    : @onUpKey
          'keys.down.down'  : @onDownKey
          'keys.down.right' : @onRightKey
          'keys.down.esc'   : @onEscKey

      @parent.on
        context : @
        event   : 'keys.down.' + @options('hotKey')
        handler : @onHotKey

      @element.css 'display', 'none'

      @defaultItems()

    visible : -> @element.css('display') isnt 'none'

    clearItems: ->
      super()
      @$('> .textext-autocomplete-no-results').remove()

    selectedIndex : ->
      items    = @$ '.textext-items-item'
      selected = items.filter '.textext-items-selected'

      items.index selected

    select : (index) ->
      items   = @$('.textext-items-item')
      newItem = items.eq index

      if newItem.length
        items.removeClass 'textext-items-selected'
        newItem.addClass 'textext-items-selected' if index >= 0

    show : -> deferred (d) =>
      @invalidate().done =>
        @element.show 0, =>
          d.resolve()

    hide : -> deferred (d) =>
      @element.hide 0, =>
        @element.css 'display', 'none'
        @select -1
        d.resolve()

    invalidate : -> deferred (d) =>
      @items.search(@parent.value()).done (items) =>
        @clearItems()

        if items.length
          @displayItems(items).done -> d.resolve()
        else
          label = @options 'noResults'
          template(@options('html.noResults'), { label }).done (html) =>
            @addItemElements html
            @emit(event: 'autocomplete.noresults').done ->
              d.resolve()

    complete : -> deferred (d) =>
      selected = @$ '.textext-items-selected'
      item = @itemData selected

      @items.toString(item).done (value) =>
        @parent.value value
        d.resolve()

    onUpKey : (keyCode) -> deferred (d) =>
      if @visible()
        index = @selectedIndex() - 1
        @select index
        @parent.focus() if index is -1

      d.resolve()

    onDownKey : (keyCode) -> deferred (d) =>
      if @visible()
        @select @selectedIndex() + 1
        d.resolve()
      else
        @show().done =>
          @select 0
          d.resolve()

    onEscKey : (keyCode) -> deferred (d) =>
      if @visible()
        @hide().done =>
          @parent.focus()
          d.resolve()
      else
        d.resolve()

    onRightKey : (keyCode) -> deferred (d) =>
      if @visible and not @parent.empty() and @parent.caretAtEnd() and @selectedIndex() is -1
        @select 0
        series(@complete(), @hide()).done -> d.resolve()
      else
        d.resolve()

    onHotKey : (keyCode) -> deferred (d) =>
      if @visible and @selectedIndex() isnt -1
        series(@complete(), @hide()).done -> d.resolve()
      else
        d.resolve()

    onInputChange : -> deferred (d) =>
      value = @parent.value()

      return d.resolve() if value.length and value.length < @options 'minLength'

      promise = if @visible() then @invalidate() else @show()
      promise.done -> d.resolve()

  # add plugin to the registery so that it is usable by TextExt
  Plugin.register 'autocomplete', AutocompletePlugin

  module.AutocompletePlugin = AutocompletePlugin
