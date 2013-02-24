do (window, $ = jQuery, module = $.fn.textext) ->
  { ItemsPlugin, InputPlugin, Plugin, deferred, series, throttle, template } = module

  NAME = 'AutocompletePlugin'

  class AutocompletePlugin extends ItemsPlugin
    @defaults =
      items            : []
      minLength        : 1
      keyThrottleDelay : 500
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
        throw name : NAME, message : 'Expects InputPlugin parent'

      @parent.on
        context : @
        events  :
          'input.change'        : throttle @onInputChange, @, @options 'keyThrottleDelay'
          'input.complete'      : @complete
          'input.keydown.up'    : @onUpKey
          'input.keydown.down'  : @onDownKey
          'input.keydown.right' : @onRightKey
          'input.keydown.esc'   : @onEscKey

      @element.on 'click', '.textext-items-item', @$onItemClick
      @element.css 'display', 'none'

      @defaultItems()

    visible : -> @element.css('display') isnt 'none'

    clearElements: ->
      super()
      @$('> .textext-autocomplete-no-results').remove()

    show : -> deferred (resolve, reject) =>
      @invalidate().fail(reject).done =>
        @element.show 0, =>
          resolve()

    hide : -> deferred (resolve, reject) =>
      @element.hide 0, =>
        @element.css 'display', 'none'
        @select -1
        resolve()

    invalidate : -> deferred (resolve, reject) =>
      @items.search(@parent.value()).fail(reject).done (items) =>
        @clearElements()

        if items.length
          @displayItems(items).then resolve, reject
        else
          label = @options 'noResults'
          template(@options('html.noResults'), { label }).fail(reject).done (html) =>
            @addItemElements html
            @emit(event: 'autocomplete.noresults').then resolve, reject

    complete : -> deferred (resolve, reject) =>
      return reject(name : NAME, message : 'Dropdown not visible') if not @visible()
      return reject(name : NAME, message : 'No item selected') if @selectedIndex() is -1

      selected = @selectedItem()
      item = @itemData selected

      return reject(name : NAME, message : 'Selected item has no data') unless item?

      @items.toString(item).fail(reject).done (string) =>
        @parent.value string
        @hide().then resolve, reject

    onUpKey : (keyCode) -> deferred (resolve, reject) =>
      if @visible()
        index = @selectedIndex() - 1
        @select index
        @parent.focus() if index is -1

      resolve()

    onDownKey : (keyCode) -> deferred (resolve, reject) =>
      if @visible()
        @select @selectedIndex() + 1
        resolve()
      else
        @show().fail(reject).done =>
          @select 0
          resolve()

    onEscKey : (keyCode) -> deferred (resolve, reject) =>
      if @visible()
        @hide().fail(reject).done =>
          @parent.focus()
          resolve()
      else
        resolve()

    onRightKey : (keyCode) -> deferred (resolve, reject) =>
      if @visible and not @parent.empty() and @parent.caretAtEnd() and @selectedIndex() is -1
        @select 0
        series(@complete(), @hide()).then resolve, reject
      else
        resolve()

    onInputChange : (lastValue, newValue) -> deferred (resolve, reject) =>
      value = @parent.value()

      return reject() if value.length and value.length < @options('minLength')

      (if @visible() then @invalidate() else @show()).then resolve, reject

    $onItemClick : (e) => deferred (resolve, reject) =>
      index = @itemIndex e.target
      @select index
      @parent.complete().then resolve, reject

  # add plugin to the registery so that it is usable by TextExt
  Plugin.register 'autocomplete', AutocompletePlugin

  module.AutocompletePlugin = AutocompletePlugin
