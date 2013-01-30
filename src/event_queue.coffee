do (window, $ = jQuery, module = $.fn.textext) ->
  { deferred } = module

  class EventQueue
    constructor : ->
      @handlers = {}
      @queue    = []
      @timeout  = 5000
      @promise  = null

    on : (opts) ->
      { event, events, handler, context } = opts
      events ?= {}
      events[event] = handler if event? and handler?

      for event, handler of events
        list = @handlers[event] ?= []
        list.push { context, handler }

    emit : (opts) ->
      @queue.push opts

      if @promise?
        @promise
      else
        @promise = deferred (d) => @next d
        @promise.always => @promise = null

    next : (d) =>
      return d.resolve() if @queue.length is 0

      { event, args } = @queue.shift() or {}

      handlers  = @handlers[event] or []
      args      ?= []
      index     = 0
      timeoutId = 0

      doneHandler = ->
        clearTimeout timeoutId
        iterate()

      failHandler = (err) =>
        clearTimeout timeoutId
        d.reject err

      iterate = =>
        { handler, context } = handlers[index++] or {}

        if handler?
          promise = handler.apply(context or handler, args)

          if promise?.then?
            timeoutId = setTimeout (-> throw new Error "Deferred not resolved for `#{event}`"), @timeout
            promise.then doneHandler, failHandler
          else
            doneHandler()
        else
          @next d

      iterate()

  module.EventQueue = EventQueue
