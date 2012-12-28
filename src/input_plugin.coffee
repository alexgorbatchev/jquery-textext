do (window, $ = jQuery, module = $.fn.textext) ->
  { Plugin, resistance, nextTick } = module

  class InputPlugin extends Plugin
    @defaults =
      plugins : 'keys'

      html :
        input : '''
          <div class="textext-input">
            <input type="text">
          </div>
        '''

    constructor : (opts = {}) ->
      super opts, InputPlugin.defaults

      @element ?= $ @options 'html.input'

      @init()
      @appendToParent()

    input : -> @$ 'input'
    value : -> @input().val.apply @input(), arguments
    focus : -> @input().focus()
    caretPosition : -> @input().get(0).selectionStart

  # add plugin to the registery so that it is usable by TextExt
  Plugin.register 'input', InputPlugin

  module.InputPlugin = InputPlugin
