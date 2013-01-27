do (window, $ = jQuery, module = $.fn.textext) ->
  { ItemsPlugin, InputPlugin, Plugin, throttle } = module

  class AutocompletePlugin extends ItemsPlugin
    @defaults =
      items     : []
      minLength : 1
      throttle  : 500
      hotKey    : 'enter'

      html :
        element : '<div class="textext-autocomplete"/>'

        item : '''
          <div class="textext-items-item">
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
          'input.change'    : throttle @onInputChange, @, @options 'throttle'
          'keys.down.up'    : @onUpKey
          'keys.down.down'  : @onDownKey
          'keys.down.right' : @onRightKey
          'keys.down.esc'   : @onEscKey

      @parent.on
        context : @
        event   : 'keys.down.' + @options('hotKey')
        handler : @onHotKey

      @element.css 'display', 'none'

    visible : -> @element.css('display') isnt 'none'

    selectedIndex : ->
      items    = @$ '.textext-items-item'
      selected = items.filter '.textext-items-selected'

      items.index selected

    select : (index) ->
      items = @$('.textext-items-item')
      newItem = items.eq index

      if newItem.length
        items.removeClass('textext-items-selected')

        if index >= 0
          newItem.addClass('textext-items-selected')

    show : (callback) ->
      @invalidate (err, items) =>
        @element.show 0, =>
          callback err, items

    hide : (callback) ->
      @element.hide 0, =>
        @element.css 'display', 'none'
        @select -1
        callback()

    invalidate : (callback) ->
      @items.search @parent.value(), (err, items) =>
        @displayItems items, callback

    complete : (callback) ->
      selected = @$ '.textext-items-selected'
      item = selected.data 'item'

      @items.toString item, (err, value) =>
        @parent.value value
        callback()

    onUpKey : (keyCode, next) ->
      if @visible()
        index = @selectedIndex() - 1
        @select index
        @parent.focus() if index is -1

      next()

    onDownKey : (keyCode, next) ->
      if @visible()
        @select @selectedIndex() + 1
        next()
      else
        @show =>
          @select 0
          next()

    onEscKey : (keyCode, next) ->
      if @visible()
        @hide =>
          @parent.focus()
          next()
      else
        next()

    onRightKey : (keyCode, next) ->
      if @visible and not @parent.empty() and @parent.caretAtEnd() and @selectedIndex() is -1
        @select 0
        @complete => @hide next
      else
        next()

    onHotKey : (keyCode, next) ->
      if @visible and @selectedIndex() isnt -1
        @complete => @hide next
      else
        next()

    onInputChange : (next1) ->
      next = ->
        console.log 'NEXT'
        next1()

      value = @parent.value()

      return next() if value.length and value.length < @options 'minLength'

      if @visible()
        @invalidate next
      else
        @show next

  # add plugin to the registery so that it is usable by TextExt
  Plugin.register 'autocomplete', AutocompletePlugin

  module.AutocompletePlugin = AutocompletePlugin
