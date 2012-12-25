do (window, $ = jQuery, module = $.fn.textext) ->
  { Plugin, WatchJS, resistance, nextTick } = module

  class TagsPlugin extends Plugin
    @defaults =
      items           : []
      allowDuplicates : true
      hotKey          : 13
      splitPaste      : /,/g

      html :
        container : '<div class="textext-tags"/>'
        item : '''
          <div class="textext-tag">
            <span class="textext-label"/>
            <a class="textext-remove"/>
          </div>
        '''

    constructor : (opts = {}) ->
      super(opts)

      @defaultOptions ?= TagsPlugin.defaults
      @element ?= $ @options 'html.container'

      # WatchJS.watch @, 'items', -> console.log arguments

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
      element.find('.textext-label').html(item)
      nextTick -> callback(null, element)

  # add plugin to the registery so that it is usable by TextExt
  Plugin.register 'tags', TagsPlugin

  module.TagsPlugin = TagsPlugin
