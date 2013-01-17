do (window, $ = jQuery, module = $.fn.textext) ->
  { ItemsPlugin, InputPlugin, Plugin, resistance, nextTick } = module

  class AutocompletePlugin extends ItemsPlugin
    @defaults =
      items  : []
      hotKey : 'enter'

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

      @parent.on 'keys.press.up'                    , @onUpKey, @
      @parent.on 'keys.press.down'                  , @onDownKey, @
      @parent.on 'keys.press.' + @options('hotKey') , @onHotKey, @
      @parent.on 'keys.press.esc'                   , @onEscKey, @

      @element.css 'display', 'none'

    visible : -> @element.css('display') isnt 'none'

    selectedIndex : ->
      items    = @$ '.textext-items-item'
      selected = items.filter '.selected'

      items.index selected

    select : (index) ->
      items = @$('.textext-items-item')
      newItem = items.eq index

      if newItem.length
        items.removeClass('selected')

        if index >= 0
          newItem.addClass('selected')

    show : (callback) ->
      @invalidate (err, items) =>
        @element.show =>
          callback err, items

    hide : (callback) ->
      @element.hide =>
        @element.css 'display', 'none'
        @select -1
        callback()

    invalidate : (callback) ->
      @items.search @parent.value(), (err, items) =>
        @setItems items, callback

    onUpKey : (keyCode, keyName) ->
      if @visible()
        index = @selectedIndex() - 1
        @select index
        @parent.focus() if index is -1

    onDownKey : (keyCode, keyName) ->
      if @visible()
        @select @selectedIndex() + 1
      else
        @show => @select 0

    onEscKey : (keyCode, keyName) ->
      if @visible()
        @hide => @parent.focus()


  # add plugin to the registery so that it is usable by TextExt
  Plugin.register 'autocomplete', AutocompletePlugin

  module.AutocompletePlugin = AutocompletePlugin
