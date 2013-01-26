do (window, $ = jQuery, module = $.fn.textext) ->
  class EventQueue
    constructor : ->
      @events = {}
      @queue = []

    on : (args...) ->
      switch args.length
        when 1 then [ events ] = args

        when 2
          [ context, events ] = args
          [ event, handler ] = args

          if typeof event is 'string' and typeof handler is 'function'
            context = null
            events = {}
            events[event] = handler

        when 3
          [ context, event, handler ] = args
          events = {}
          events[event] = handler

      if context? and typeof context isnt 'object'
        throw 'Context is not an object'

      for event, handler of events
        list = @events[event] ?= []
        list.push { context, handler }

    emit : (event, args = [], callback = ->) ->
      if typeof args is 'function'
        callback = args
        args = []

      console.log '>', event, args
      @queue.push { event, args, callback }
      @next() if @queue.length is 1

    next : ->
      { event, args, callback } = @queue[0] or {}

      return unless event?

      console.log event, args
      handlers = @events[event] or []
      index    = 0
      results  = []

      nextHandler = (err, handlerResults...) =>
        advance = =>
          callback and callback err, results
          @queue.shift()
          @next()

        results.push handlerResults if index > 0

        return advance() if err?

        { handler, context } = handlers[index] or {}

        if handler?
          index++
          handler.apply context or handler, args.concat [ nextHandler ]
        else
          advance()

      nextHandler()

  module.EventQueue = EventQueue
