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
            <a href="#">&times;</a>
          </div>
        '''

    constructor : (opts = {}) ->
      super opts, TagsPlugin.defaults

      @element ?= $ @options 'html.container'

      @on 'keys.press.left'      , @onLeftKey
      @on 'keys.press.right'     , @onRightKey
      @on 'keys.press.backspace' , @onBackspaceKey
      @on 'keys.press.enter'     , @onEnterKey

      @init()
      @appendToParent()

      @input = @getPlugin 'input'

    setItems : (items, callback) ->
      @element.find('.textext-tags-tag').remove()

      jobs = for item in items
        do (item) => (done) => @createItemElement item, done

      resistance.series jobs, (err, elements...) =>
        unless err?
          @element.append element for element in elements
          @moveInputTo()

        callback err, elements

    addItem : (item, callback) ->
      # TODO hook up item manager

      @createItemElement item, (err, element) =>
        unless err?
          @input.element.before element

        callback err, element

    inputPosition : -> @$('> div').index @input.element

    removeItemByIndex : (index, callback) ->
      # TODO hook up item manager

      item = @$(".textext-tags-tag:eq(#{index})").remove()
      nextTick -> callback null, item

    createItemElement : (item, callback) ->
      element = $ @options 'html.item'
      # TODO use manager
      element.find('.textext-tags-label').html item
      nextTick -> callback null, element

    moveInputTo : (index) ->
      items = @$ '> .textext-tags-tag'

      return if items.length is 0

      if index? and index < items.length
        @input.element.insertBefore items[index]
      else
        @input.element.insertAfter items.last()

    onLeftKey : ->
      if @input.empty()
        @moveInputTo @inputPosition() - 1
        @input.focus()

    onRightKey : ->
      if @input.empty()
        @moveInputTo @inputPosition() + 1
        @input.focus()

    onBackspaceKey : ->
      if @input.empty()
        @removeItemByIndex @inputPosition() - 1, -> null

    onEnterKey : ->
      # TODO use manager
      item = @input.value()
      @addItem item, =>
        @input.value ''

  # add plugin to the registery so that it is usable by TextExt
  Plugin.register 'tags', TagsPlugin

  module.TagsPlugin = TagsPlugin
