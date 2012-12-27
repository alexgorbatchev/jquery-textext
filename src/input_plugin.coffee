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
      super
        element        : opts.element
        userOptions    : opts.userOptions
        defaultOptions : opts.defaultOptions or InputPlugin.defaults

      @element ?= $ @options 'html.input'

    input : -> @$ 'input'
    value : -> @input().val.apply @input(), arguments
    getCaretPosition : -> @input().get(0).selectionStart

  # add plugin to the registery so that it is usable by TextExt
  Plugin.register 'input', InputPlugin

  module.InputPlugin = InputPlugin
