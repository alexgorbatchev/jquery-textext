window= jQuery= null

do (window, $ = jQuery) ->
  class Plugin
    constructor: (core) ->
      @plugins = []
      @core = core or @

      if @.properties?
        Object.defineProperties @, @.properties
        delete @.propertie

    addPlugin: (instance) -> @plugins.push instance

    trigger: -> $(@core).trigger arguments
    bind: -> $(@core).bind arguments

    # properties:
    #   core:
    #     get: -> @_core

