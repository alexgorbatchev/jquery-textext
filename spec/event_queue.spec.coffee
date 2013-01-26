{ EventQueue } = $.fn.textext

describe 'EventQueue', ->
  queue = null

  beforeEach ->
    queue = new EventQueue

  describe '.on', ->
    it 'adds event handlers', ->
      queue.on
        'event1' : -> null
        'event2' : -> null

      expect(queue.events['event1'].length).to.equal 1
      expect(queue.events['event2'].length).to.equal 1

  describe '.emit', ->
    it 'emits an event', ->
      emitted = false
      queue.on 'event': (next) -> emitted = true; next()
      queue.emit 'event'
      expect(emitted).to.be.true

    it 'uses specified context', ->
      context = hello : 'world'

      queue.on context, 'event' : (next) ->
        expect(@hello).to.equal 'world'
        next()

      queue.emit 'event'

    it 'passes arguments to the handler', ->
      result = 0
      queue.on 'event': (arg1, arg2, next) -> result = arg1 + arg2; next()
      queue.emit 'event', [ 3, 2 ]
      expect(result).to.equal 5

    it 'executes handlers in a queue', (done) ->
      result = ''

      queue.on 'event': (next) -> result += '1'; setTimeout next, 50
      queue.on 'event': (next) -> result += '2'; setTimeout next, 50
      queue.on 'event': (next) -> result += '3'; setTimeout next, 50

      queue.on 'event1': (next) -> result += 'a'; next()

      mid = ''

      queue.emit 'event', ->
        mid = result
        result = ''

      setTimeout ->
        queue.emit 'event1', ->
          expect(mid).to.equal '123'
          expect(result).to.equal 'a'
          done()
      , 25

    it 'stops the queue if there is an error', (done) ->
      result = ''

      queue.on 'event': (next) -> result += '1'; next()
      queue.on 'event': (next) -> result += '2'; next message: 'error'
      queue.on 'event': (next) -> result += '3'; next()

      queue.emit 'event', (err) ->
        expect(result).to.equal '12'
        expect(err.message).to.equal 'error'
        done()

    it 'collects results', (done) ->
      queue.on 'event': (next) -> next null, 1, 2
      queue.on 'event': (next) -> next null, 3, 4
      queue.on 'event': (next) -> next null, 5, 6

      queue.emit 'event', (err, results) ->
        expect(results).to.deep.equal [[ 1, 2 ], [ 3, 4 ], [ 5, 6 ]]
        done()

    it 'works in fire and forget mode' ->
      result = ''

      queue.on 'event1': (next) -> result += '1'; next()
      queue.on 'event2': (next) -> result += '2'; next()
      queue.on 'event3': (next) -> result += '3'; next()

      queue.emit 'event1'
      queue.emit 'event2'
      queue.emit 'event3'

      expect(result).to.equal '123'

    it 'executes callback when there are no event handlers', (done) ->
      queue.emit 'event', done
