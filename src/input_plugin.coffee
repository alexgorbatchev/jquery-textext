do (window, $ = jQuery, module = $.fn.textext) ->
  { Plugin, deferred, nextTick } = module

  class InputPlugin extends Plugin
    @defaults =
      plugins     : ''
      completeKey : /enter|,/
      keys :
        8   : name : 'backspace'
        9   : name : 'tab'
        13  : name : 'enter', trap : true
        27  : name : 'esc', trap : true
        37  : name : 'left'
        38  : name : 'up', trap : true
        39  : name : 'right'
        40  : name : 'down', trap : true
        46  : name : 'delete'
        108 : name : 'numpadEnter'
        188 : name : 'comma'

      html :
        element : '''
          <div class="textext-input">
            <input type="text">
          </div>
        '''

    constructor : (opts = {}) ->
      super opts, InputPlugin.defaults

      @lastValue = @value()

      @on event: 'input.keysdown', handler: @onKeyDown

      @element
        .on('keydown', 'input', @$onKeyDown)
        .on('keyup', 'input', @$onKeyUp)
        .on('keypress', 'input', @$onKeyPress)

    input         : -> @$ 'input'
    value         : -> @input().val.apply @input(), arguments
    empty         : -> @value().length is 0
    focus         : -> @input().focus()
    hasFocus      : -> @input().is ':focus'
    caretPosition : -> @input().get(0).selectionStart
    caretAtEnd    : -> @caretPosition() is @value().length

    key : (keyCode) -> @options("keys.#{keyCode}")

    complete : -> deferred (d) =>
      @emit(event: 'input.complete').done ->
        d.resolve()

    onKeyDown : (e) -> deferred (d) =>
      value = @value()

      return d.resolve() if value is @lastValue

      @lastValue = value
      @emit(event: 'input.change').done ->
        d.resolve()

    $onKeyDown : (e) =>
      completeKey = @options 'completeKey'
      keyCode     = e.keyCode
      key         = @key keyCode

      @emit event: 'input.keydown', args: [ keyCode ]
      @emit event: "input.keydown.#{key.name}", args: [ keyCode ] if key?

      isKeyCode = completeKey.test(keyCode)
      isKeyName = key? and completeKey.test(key.name)
      isKeyChar = completeKey.test String.fromCharCode keyCode

      if isKeyCode or isKeyName or isKeyChar
        @complete()
        return false

      key?.trap isnt true

    $onKeyUp : (e) =>
      keyCode = e.keyCode
      key     = @key keyCode

      @emit event: 'input.keyup', args: [ keyCode ]
      @emit event: "input.keyup.#{key.name}", args: [ keyCode ] if key?

      key?.trap isnt true

    $onKeyPress : (e) =>
      keyCode = e.keyCode
      key     = @key keyCode

      @emit event: 'input.keypress', args: [ keyCode ]
      @emit event: "input.keypress.#{key.name}", args: [ keyCode ] if key?

      key?.trap isnt true

  # add plugin to the registery so that it is usable by TextExt
  Plugin.register 'input', InputPlugin

  module.InputPlugin = InputPlugin
