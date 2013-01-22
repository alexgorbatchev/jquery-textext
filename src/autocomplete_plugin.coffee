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
            <span class="textext-items-label"/>
          </div>
        '''

    constructor : (opts = {}) ->
      super opts, AutocompletePlugin.defaults

      if @parent? and not (@parent instanceof InputPlugin)
        throw name : 'AutocompletePlugin', message : 'Expects InputPlugin parent'

      @parent.on 'input:change'                    , throttle @onInputChange, @, @options 'throttle'
      @parent.on 'keys:down:up'                    , @onUpKey, @
      @parent.on 'keys:down:down'                  , @onDownKey, @
      @parent.on 'keys:down:right'                 , @onRightKey, @
      @parent.on 'keys:down:esc'                   , @onEscKey, @
      @parent.on 'keys:down:' + @options('hotKey') , @onHotKey, @

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

    onUpKey : ->
      if @visible()
        index = @selectedIndex() - 1
        @select index
        @parent.focus() if index is -1

    onDownKey : ->
      if @visible()
        @select @selectedIndex() + 1
      else
        @show => @select 0

    onEscKey : ->
      if @visible()
        @hide => @parent.focus()

    onRightKey : ->
      if @visible and not @parent.empty() and @parent.caretAtEnd() and @selectedIndex() is -1
        @select 0
        @complete => @hide => null

    onHotKey : (keyCode) ->
      if @visible and @selectedIndex() isnt -1
        @complete => @hide => null

    onInputChange : ->
      value = @parent.value()

      return if value.length and value.length < @options 'minLength'

      done = => null

      if @visible()
        @invalidate done
      else
        @show done

  # add plugin to the registery so that it is usable by TextExt
  Plugin.register 'autocomplete', AutocompletePlugin

  module.AutocompletePlugin = AutocompletePlugin
