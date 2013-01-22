do (window, $ = jQuery, module = $.fn.textext) ->
  { Plugin } = module

  class InputPlugin extends Plugin
    @defaults =
      plugins : ''

      html :
        element : '''
          <div class="textext-input">
            <input type="text">
          </div>
        '''

    constructor : (opts = {}) ->
      super opts, InputPlugin.defaults

      @plugins['keys'] = @createPlugins 'keys'
      @lastValue = @value()

      @on 'keys:down', @onKeyDown, @

    input : -> @$ 'input'
    value : -> @input().val.apply @input(), arguments
    empty : -> @value().length is 0
    focus : -> @input().focus()
    hasFocus : -> @input().is ':focus'
    caretPosition : -> @input().get(0).selectionStart
    caretAtEnd : -> @caretPosition() is @value().length

    onKeyDown : ->
      value = @value()

      return if value is @lastValue

      @lastValue = value
      @emit 'input:change'

  # add plugin to the registery so that it is usable by TextExt
  Plugin.register 'input', InputPlugin

  module.InputPlugin = InputPlugin
