do (window, $ = jQuery) ->
  module = $.fn.textext = (opts) ->
    return $(@).data('textext') if opts?.instance

    @map ->
      self = $ @
      instance = self.data 'textext'

      return instance if not opts and instance?

      opts = $.extend {}, { element : self }, opts
      self.data 'textext', new module.TextExt opts

      @
