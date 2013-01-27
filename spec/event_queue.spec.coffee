{ EventQueue } = $.fn.textext

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

      expect(queue.events['event1'].length).to.equal 1
      expect(queue.events['event2'].length).to.equal 1

  describe '.emit', ->
    it 'emits an event', ->
      emitted = false

      queue.on
        event   : 'event'
        handler : (next) -> emitted = true; next()

      queue.emit event: 'event'
      expect(emitted).to.be.true

    it 'uses specified context', ->
      context = hello : 'world'

      queue.on
        context : context
        events  :
          'event' : (next) ->
            expect(@hello).to.equal 'world'
            next()

      queue.emit event: 'event'

    it 'passes arguments to the handler', ->
      result = 0

      queue.on
        event   : 'event'
        handler : (arg1, arg2, next) -> result = arg1 + arg2; next()

      queue.emit event: 'event', args: [ 3, 2 ]
      expect(result).to.equal 5

    it 'executes handlers in a queue', (done) ->
      result = ''

      queue.on event: 'event', handler: (next) -> result += '1'; setTimeout next, 70
      queue.on event: 'event', handler: (next) -> result += '2'; setTimeout next, 20
      queue.on event: 'event', handler: (next) -> result += '3'; setTimeout next, 30

      queue.on event: 'event1', handler: (next) -> result += '5'; next()

      queue.emit
        event : 'event'
        done  : ->
          result += '4'

      setTimeout ->
        queue.emit
          event : 'event1'
          done  : ->
            expect(result).to.equal '12345'
            done()
      , 25

    it 'stops the queue if there is an error', (done) ->
      result = ''

      queue.on event: 'event', handler: (next) -> result += '1'; next()
      queue.on event: 'event', handler: (next) -> result += '2'; next message: 'error'
      queue.on event: 'event', handler: (next) -> result += '3'; next()

      queue.emit
        event : 'event'
        done  : (err) ->
          expect(result).to.equal '12'
          expect(err.message).to.equal 'error'
          done()

    it 'collects results', (done) ->
      queue.on event: 'event', handler: (next) -> next null, 1, 2
      queue.on event: 'event', handler: (next) -> next null, 3, 4
      queue.on event: 'event', handler: (next) -> next null, 5, 6

      queue.emit
        event : 'event'
        done  : (err, results) ->
          expect(results).to.deep.equal [[ 1, 2 ], [ 3, 4 ], [ 5, 6 ]]
          done()

    it 'does not need a `done` callback', ->
      result = ''

      queue.on event: 'event1', handler: (next) -> result += '1'; next()
      queue.on event: 'event2', handler: (next) -> result += '2'; next()
      queue.on event: 'event3', handler: (next) -> result += '3'; next()

      queue.emit event: 'event1'
      queue.emit event: 'event2'
      queue.emit event: 'event3'

      expect(result).to.equal '123'

    it 'can emit from event handler', (done) ->
      result = ''

      queue.on
        event   : 'event1'
        handler : (next) ->
          result += '1'
          queue.emit event: 'event2', done: next

      queue.on
        event   : 'event2'
        handler : (next) ->
          result += '2'
          next()

      queue.emit
        event : 'event1'
        done  : ->
          expect(result).to.equal '12'
          done()

    it 'executes callback when there are no event handlers', (done) ->
      queue.emit event: 'event', done: done
