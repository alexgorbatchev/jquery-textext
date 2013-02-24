do (window, $ = jQuery, module = $.fn.textext) ->
  { nextTick, deferred } = module

  class EventQueue
    constructor : ->
      @handlers = {}
      @promises = {}
      @queues   = {}
      @timeout  = 5000
      @promise  = null

    on : (opts) ->
      { event, events, handler, context } = opts
      events ?= {}
      events[event] = handler if event? and handler?

      for event, handler of events
        list = @handlers[event] ?= []
        list.push { context, handler }

    emit : ({ event, args }) ->
      queue   = @queues[event] ?= []
      promise = @promises[event]

      queue.push args

      return promise if promise?

      d = $.Deferred()
      @promises[event] = d.promise()

      @next d, event

      d.always =>
        delete @queues[event] = null
        delete @promises[event] = null

    next : (d, event) =>
      queue = @queues[event]

      return d.resolve() if queue.length is 0

      args = queue.shift()

      @iterateHandlers(event, args).then(
        => @next d, event
        (args...) => d.reject args...
      )

    iterateHandlers : (event, args = []) -> deferred (resolve, reject) =>
      handlers  = @handlers[event] or []
      index     = 0
      timeoutId = 0

      nextHandler = ->
        clearTimeout timeoutId
        iterate()

      rejected = (err) =>
        clearTimeout timeoutId
        reject err

      iterate = =>
        return resolve() if index >= handlers.length
        { handler, context } = handlers[index++]

        promise = handler.apply(context or handler, args)

        if promise?.then?
          timeoutId = setTimeout (-> throw new Error "Deferred not resolved for `#{event}`"), @timeout
          promise.then nextHandler, rejected
        else
          nextHandler()

      iterate()

  module.EventQueue = EventQueue
