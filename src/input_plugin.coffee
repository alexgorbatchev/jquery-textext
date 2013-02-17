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

      @on event: 'input.keydown', handler: @onKeyDown

      @element
        .on('keydown', 'input', @$onKeyDown)
        .on('keyup', 'input', @$onKeyUp)
        .on('keypress', 'input', @$onKeyPress)

    input         : -> @$ 'input'
    value         : -> @input().val.apply @input(), arguments
    empty         : -> @value().length is 0
    focus         : -> @input().focus()
    caretPosition : -> @input().get(0).selectionStart
    caretAtEnd    : -> @caretPosition() is @value().length

    keyInfo : ({ keyCode, charCode }) ->
      { name, trap } = @options("keys.#{keyCode}") or {}

      {
        name
        trap
        code : keyCode
        char : String.fromCharCode charCode if charCode?
      }

    isCompleteKey : ({ code, char, name }) ->
      completeKey = @options 'completeKey'
      isKeyCode   = completeKey.test code if code?
      isKeyName   = completeKey.test name if name?
      isKeyChar   = completeKey.test char if char?

      !! ( isKeyCode or isKeyName or isKeyChar )

    complete : -> deferred (d) =>
      @emit(event: 'input.complete').done ->
        d.resolve()

    onKeyDown : (keyCode) -> deferred (d) => nextTick =>
      value = @value()

      return d.resolve() if value is @lastValue

      @lastValue = value
      console.log keyCode, value
      @emit(event: 'input.change').done ->
        d.resolve()

    $onKeyDown : (e) =>
      keyInfo = @keyInfo e

      @emit event: 'input.keydown', args: [ keyInfo.code ]
      @emit event: "input.keydown.#{keyInfo.name}", args: [ keyInfo.code ] if keyInfo.name?

      if @isCompleteKey keyInfo
        @complete()
        return false

      keyInfo.trap isnt true

    $onKeyUp : (e) =>
      keyInfo = @keyInfo e

      @emit event: 'input.keyup', args: [ keyInfo.code ]
      @emit event: "input.keyup.#{keyInfo.name}", args: [ keyInfo.code ] if keyInfo.name?

      keyInfo.trap isnt true

    $onKeyPress : (e) =>
      keyInfo = @keyInfo e

      @emit event: 'input.keypress', args: [ keyInfo.code ]
      @emit event: "input.keypress.#{keyInfo.name}", args: [ keyInfo.code ] if keyInfo.name?

      if @isCompleteKey keyInfo
        @complete()
        return false

      keyInfo.trap isnt true

  # add plugin to the registery so that it is usable by TextExt
  Plugin.register 'input', InputPlugin

  module.InputPlugin = InputPlugin
