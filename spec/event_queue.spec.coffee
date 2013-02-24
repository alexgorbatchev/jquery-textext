{ EventQueue, deferred, series, nextTick } = $.fn.textext

describe 'EventQueue', ->
  queue = null

  beforeEach ->
    queue = new EventQueue
    queue.timeout = 300

  describe '.on', ->
    it 'adds event handlers', ->
      queue.on
        events:
          'event1' : -> null
          'event2' : -> null

      expect(queue.handlers['event1'].length).to.equal 1
      expect(queue.handlers['event2'].length).to.equal 1

  describe '.emit', ->
    it 'emits an event', ->
      emitted = false

      queue.on
        event   : 'event'
        handler : -> emitted = true

      queue.emit event: 'event'
      expect(emitted).to.be.true

    it 'uses specified context', ->
      context = hello : 'world'

      queue.on
        context : context
        events  :
          'event' : -> expect(@hello).to.equal 'world'

      queue.emit event: 'event'

    it 'passes arguments to the handler', ->
      result = 0

      queue.on
        event   : 'event'
        handler : (arg1, arg2) -> result = arg1 + arg2

      queue.emit event: 'event', args: [ 3, 2 ]
      expect(result).to.equal 5

    it 'executes handlers in a queue', (done) ->
      result = ''

      queue.on event: 'event', handler: -> deferred (resolve, reject) -> result += '1'; setTimeout (-> resolve()), 50
      queue.on event: 'event', handler: -> deferred (resolve, reject) -> result += '2'; setTimeout (-> resolve()), 50
      queue.on event: 'event', handler: -> deferred (resolve, reject) -> result += '4'; setTimeout (-> resolve()), 50

      queue.on event: 'event1', handler: -> result += '3'

      queue.emit(event : 'event').done ->
        result += '5'
        expect(result).to.equal '12345'
        done()

      setTimeout (-> queue.emit(event : 'event1')), 75

    it 'stops the queue if there is an error', (done) ->
      result = ''

      queue.on event: 'event', handler: -> result += '1'
      queue.on event: 'event', handler: -> deferred (resolve, reject) -> result += '2'; reject message: 'error'
      queue.on event: 'event', handler: -> result += '3'

      queue.emit(event : 'event').fail (err) ->
        expect(result).to.equal '12'
        expect(err.message).to.equal 'error'
        done()

    it 'can emit from event handler', (done) ->
      result = ''

      queue.on
        event   : 'event1'
        handler : -> deferred (resolve, reject) ->
          nextTick ->
            result += '1'

            queue.emit(event: 'event2').done ->
              nextTick ->
                resolve()

      queue.on
        event   : 'event2'
        handler : -> deferred (resolve, reject) ->
          nextTick ->
            result += '2'
            resolve()

      queue.emit(event : 'event1').done ->
        expect(result).to.equal '12'
        done()

    it 'executes callback when there are no event handlers', ->
      result = ''

      queue.on event: 'event1', handler: -> result += '1'
      queue.on event: 'event2', handler: -> result += '2'
      queue.on event: 'event3', handler: -> result += '3'

      queue.emit(event: 'event1')
      queue.emit(event: 'event2')
      queue.emit(event: 'event3')

      expect(result).to.equal '123'

    it 'can emit same event multiple times', ->
      result = ''

      queue.on event: 'event', handler: -> result += '*'

      series(
        queue.emit(event: 'event')
        queue.emit(event: 'event')
        queue.emit(event: 'event')
      ).done ->
        expect(result).to.equal '***'
