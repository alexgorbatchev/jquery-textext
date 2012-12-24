do (window, $ = jQuery, module = $.fn.textext) ->
  { Plugin } = module

  class KeysPlugin extends Plugin
    @defaults =
      keys :
        8   : 'backspace'
        9   : 'tab'
        13  : 'enter!'
        27  : 'escape!'
        37  : 'left'
        38  : 'up!'
        39  : 'right'
        40  : 'down!'
        46  : 'delete'
        108 : 'numpadEnter'

    constructor : (userOptions) ->
      super $.extend {}, KeysPlugin.defaults, userOptions

      @emit 'test'

  Plugin.register 'keys', KeysPlugin

  module.KeysPlugin = KeysPlugin
