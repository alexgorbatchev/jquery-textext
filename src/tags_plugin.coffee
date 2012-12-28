do (window, $ = jQuery, module = $.fn.textext) ->
  { Plugin, resistance, nextTick } = module

  class TagsPlugin extends Plugin
    @defaults =
      plugins    : 'input'
      items      : []
      hotKey     : 13
      splitPaste : /\s*,\s*/g

      html :
        container : '<div class="textext-tags"/>'

        item : '''
          <div class="textext-tags-tag">
            <span class="textext-tags-label"/>
            <a/>
          </div>
        '''

    constructor : (opts = {}) ->
      super opts, TagsPlugin.defaults

      @element ?= $ @options 'html.container'

      @on 'keys.press.left'      , @onLeftKey
      @on 'keys.press.right'     , @onRightKey
      @on 'keys.press.backspace' , @onBackspaceKey
      @on 'keys.press.enter'     , @onEnterKey
      # @on 'keys.press.*'         , @onFunctionKeyPress
      # @on 'keys.press.code.*'    , @onKeyPress

      @init()
      @appendToParent()

      @input = @getPlugin 'input'

    onKeyPress : (keyCode) ->

    onFunctionKeyPress : (keyCode, keyName) ->

    setItems : (items, callback) ->
      @element.find('.textext-tags-tag').remove()

      jobs = for item in items
        do (item) => (done) => @createItemElement item, done

      resistance.series jobs, (err, elements...) =>
        unless err?
          @element.append element for element in elements
          @moveInput()

        callback and callback err, elements

    addItem : (item, callback) ->
      @createItemElement item, (err, element) =>
        unless err?
          @element.append element
          @moveInput()

        callback and callback err, element

    addItemFromInput : (callback) ->
      # TODO use manager
      item = @input.value()
      @input.value ''

      @createItemElement item, (err, element) =>
        unless err?
          @input.element.before element

        callback and callback err, element

    createItemElement : (item, callback) ->
      element = $ @options 'html.item'
      # TODO use manager
      element.find('.textext-tags-label').html item
      nextTick -> callback null, element

    moveInput : (index) ->
      items = @$ '> .textext-tags-tag'

      return if items.length is 0

      if index? and index < items.length
        @input.element.insertBefore items[index]
      else
        @input.element.insertAfter items.last()

    onLeftKey : ->
    onRightKey : ->
    onBackspaceKey : ->

    onEnterKey : -> @addItemFromInput -> null

  # add plugin to the registery so that it is usable by TextExt
  Plugin.register 'tags', TagsPlugin

  module.TagsPlugin = TagsPlugin
