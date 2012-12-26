do (window, $ = jQuery, module = $.fn.textext) ->
  { Plugin, resistance, nextTick } = module

  class InputPlugin extends Plugin
    @defaults =
      html :
        input : '''
          <div class="textext-input">
            <input/>
          </div>
        '''

    constructor : (opts = {}) ->
      super(opts)

      @defaultOptions ?= InputPlugin.defaults
      @element ?= $ @options 'html.input'

  # add plugin to the registery so that it is usable by TextExt
  Plugin.register 'input', InputPlugin

  module.InputPlugin = InputPlugin
