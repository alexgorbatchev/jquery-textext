do (window, $ = jQuery, module = $.fn.textext) ->
  { Plugin } = module

  class TagsPlugin extends Plugin
    @defaults =
      items           : null
      allowDuplicates : true
      hotKey          : 13
      splitPaste      : /,/g

      html :
        tags : '<div class="text-tags"/>'
        tag  : '<div class="text-tag"><div class="text-button"><span class="text-label"/><a class="text-remove"/></div></div>'

    constructor : (userOptions) ->
      super $.extend {}, TagsPlugin.defaults, userOptions

  # add plugin to the registery so that it is usable by TextExt
  Plugin.register 'tags', TagsPlugin

  module.TagsPlugin = TagsPlugin
