do (window, $ = jQuery, module = $.fn.textext) ->
  { Plugin, resistance, nextTick } = module

  class TagsPlugin extends Plugin
    @defaults =
      items      : []
      hotKey     : 13
      splitPaste : /\s*,\s*/g

      html :
        container : '<div class="textext-tags"/>'

        input : '''
          <div class="textext-tags-input">
            <input/>
          </div>
        '''

        item : '''
          <div class="textext-tags-tag">
            <span class="textext-tags-label"/>
            <a/>
          </div>
        '''

    constructor : (opts = {}) ->
      super
        element        : opts.element
        userOptions    : opts.userOptions
        defaultOptions : opts.defaultOptions or TagsPlugin.defaults

      @element ?= $ @options 'html.container'
      @input   ?= $ @options 'html.input'

      @element.append @input

      @on 'keys.press.left', @onLeftKeyPress
      @on 'keys.press.right', @onRightKeyPress
      @on 'keys.press.backspace', @onBackspaceKeyPress

    setItems : (@items, callback) ->
      jobs = for item in @items
        do (item) => (done) => @createItemElement item, done

      resistance.parallel jobs, (err, elements...) =>
        unless err?
          for element in elements
            @element.append element

        callback and callback err

    createItemElement : (item, callback) ->
      element = $ @options 'html.item'
      # TODO use manager
      element.find('.textext-tags-label').html(item)
      nextTick -> callback(null, element)

    moveInputTo : (index) ->
      if index < @items.length
        tag = @$("> .textext-tags-tag:nth(#{index})")
        tag.before @input
      else
        tag = @$("> .textext-tags-tag:last")
        tag.after @input

    onLeftKeyPress : ->
    onRightKeyPress : ->
    onBackspaceKeyPress : ->

  # add plugin to the registery so that it is usable by TextExt
  Plugin.register 'tags', TagsPlugin

  module.TagsPlugin = TagsPlugin
