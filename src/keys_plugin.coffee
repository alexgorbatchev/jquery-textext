do (window, $ = jQuery, module = $.fn.textext) ->
  { Plugin } = module

  class KeysPlugin extends Plugin
    @defaults =
      keys :
        8   : { name : 'backspace' }
        9   : { name : 'tab' }
        13  : { name : 'enter', trap : true }
        27  : { name : 'escape', trap : true }
        37  : { name : 'left' }
        38  : { name : 'up', trap : true }
        39  : { name : 'right' }
        40  : { name : 'down', trap : true }
        46  : { name : 'delete' }
        108 : { name : 'numpadEnter' }

    constructor : (opts = {}) ->
      super(opts)

      @defaultOptions ?= KeysPlugin.defaults
      @downKeys = {}

      @element
        .keydown((e) => @onKeyDown e.keyCode)
        .keyup((e) => @onKeyUp e.keyCode)

    key : (keyCode) ->
      @options("keys.#{keyCode}") or name : "code.#{keyCode}"

    onKeyDown : (keyCode) ->
      @downKeys[keyCode] = true
      key = @key keyCode
      @emit "key.down.#{key.name}"
      key.trap isnt true

    onKeyUp : (keyCode) ->
      key = @key keyCode
      @emit "key.up.#{key.name}"
      @emit "key.press.#{key.name}" if @downKeys[keyCode]
      @downKeys[keyCode] = false
      key.trap isnt true

  Plugin.register 'keys', KeysPlugin

  module.KeysPlugin = KeysPlugin
