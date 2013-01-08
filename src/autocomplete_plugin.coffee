do (window, $ = jQuery, module = $.fn.textext) ->
  { ItemsUIPlugin, InputPlugin, Plugin, resistance, nextTick } = module

  class AutocompletePlugin extends ItemsUIPlugin
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
      @init()

      if @parent? and not (@parent instanceof InputPlugin)
        throw name : 'AutocompletePlugin', message : 'Expects InputPlugin parent'

      @on 'keys.press.up'                    , @onUpKey
      @on 'keys.press.down'                  , @onDownKey
      @on 'keys.press.' + @options('hotKey') , @onHotKey

      @element.css 'display', 'none'

    visible : -> @element.css('display') isnt 'none'

    selectedIndex : ->
      items    = @$ '.textext-items-item'
      selected = @$ '.textext-items-item.selected'

      items.index selected

    select : (index) ->
      @$('.textext-items-item')
        .removeClass('selected')
        .eq(index)
        .addClass('selected')

    show : (callback) ->
      @invalidate (err, items) =>
        @element.show =>
          @select 0
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

    onDownKey : (keyCode, keyName) ->
      unless @visible()
        @show =>

    onHotKey : (keyCode, keyName) ->
      # unless @input.empty()
      #   @items.fromString @input.value(), (err, item) =>
      #     unless err?
      #       @items.add item, (err, item) => @input.value ''

  # add plugin to the registery so that it is usable by TextExt
  Plugin.register 'autocomplete', AutocompletePlugin

  module.AutocompletePlugin = AutocompletePlugin
