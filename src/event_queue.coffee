do (window, $ = jQuery, module = $.fn.textext) ->
  class EventQueue
    constructor : ->
      @events  = {}
      @queue   = []
      @timeout = 500

    on : (opts) ->
      { event, events, handler, context } = opts
      events ?= {}
      events[event] = handler if event? and handler?

      for event, handler of events
        list = @events[event] ?= []
        list.push { context, handler }

    emit : (opts) ->
      console.log opts

      @queue.push opts
      @next() if @queue.length is 1

    next : ->
      { event, args, done } = eventToHandle or @queue[0] or {}
      return unless event?

      handlers  = @events[event] or []
      args      ?= []
      results   = []
      index     = 0
      timeoutId = 0

      nextHandler = (err, handlerResults...) =>
        clearTimeout timeoutId
        results.push handlerResults
        if err? then nextInQueue(err) else iterate()

      nextInQueue = (err) =>
        done and done err, results
        console.log @queue
        @queue.shift()
        @next()

      iterate = =>
        { handler, context } = handlers[index++] or {}

        if handler?
          timeoutId = setTimeout (-> throw new Error "Next not called for `#{event}` by `#{handler}`"), @timeout
          handler.apply context or handler, args.concat [ nextHandler ]
        else
          nextInQueue()

      iterate()

  module.EventQueue = EventQueue
