do (window, $ = jQuery, module = $.fn.textext) ->
  { Plugin, deferred } = module

  class InputPlugin extends Plugin
    @defaults =
      plugins     : ''
      completeKey : 'enter'

      html :
        element : '''
          <div class="textext-input">
            <input type="text">
          </div>
        '''

    constructor : (opts = {}) ->
      console.log opts
      super opts, InputPlugin.defaults

      @plugins['keys'] = @createPlugins 'keys'
      @lastValue = @value()

      @on event: 'keys.down', handler: @onKeyDown

      @on
        event   : 'keys.down.' + @options('completeKey')
        handler : @onHotKey

    input         : -> @$ 'input'
    value         : -> @input().val.apply @input(), arguments
    empty         : -> @value().length is 0
    focus         : -> @input().focus()
    hasFocus      : -> @input().is ':focus'
    caretPosition : -> @input().get(0).selectionStart
    caretAtEnd    : -> @caretPosition() is @value().length

    complete : -> deferred (d) =>
      @emit(event: 'input.complete').done ->
        d.resolve()

    onHotKey : (keyCode) ->
      @complete()

    onKeyDown : (keyCode) -> deferred (d) =>
      value = @value()

      return d.resolve() if value is @lastValue

      @lastValue = value
      @emit(event: 'input.change').done ->
        d.resolve()

  # add plugin to the registery so that it is usable by TextExt
  Plugin.register 'input', InputPlugin

  module.InputPlugin = InputPlugin
