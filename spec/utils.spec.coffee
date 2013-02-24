{ opts, deferred, series, template, equals } = $.fn.textext

describe 'utils', ->
  describe '.equals', ->
    a = b = null

    beforeEach ->
      a =
        foo : 1
        bar : 'hey'
        obj : nested : 'value'
        list : [ 1, 2, { foo: 'bar' } ]

      b = JSON.parse JSON.stringify a

    it 'returns `true` when two complex objects have the same properties', ->
      expect(equals a, b).to.be.true

    it 'returns `false` when two complex objects have differences', ->
      b.list[2].diff = true
      expect(equals a, b).to.be.false

  describe '.series', ->
    it 'executes deferreds in order waiting for each to finish', (done) ->
      result = ''

      fn = (num) -> deferred (resolve, reject) ->
        result += num
        setTimeout (-> resolve()), 50

      series(fn(1), fn(2), fn(3)).done ->
        expect(result).to.equal '123'
        done()

    it 'resolves with arguments', ->
      fn = (num) -> deferred (resolve, reject) ->
        resolve num

      series(fn(1), fn(2), fn(3)).done (results...) ->
        expect(results).to.eql [ [ 1 ], [ 2 ], [ 3 ] ]

  describe '.template', ->
    it 'renders a template', (done) ->
      name = 'Alex'
      template('Hello <%= name %>', { name : 'Alex' }).done (result) ->
        expect(result).to.equal 'Hello Alex'
        done()

  describe '.opts', ->
    hash =
      version : 1
      paramLength : 10
      settings :
        name : 'bob'
        paths :
          home : '/users'
          systemLogs : '/logs'
        hostNames :
          remoteEnd : 'bob-remote'

    it 'returns undefined without options', -> expect(opts null, 'version').to.equal undefined
    it 'returns undefined when not found', -> expect(opts hash, 'invalid').to.equal undefined
    it 'returns single word value', -> expect(opts hash, 'version').to.equal 1
    it 'returns two word option', -> expect(opts hash, 'paramLength').to.equal 10

    describe 'nested values', ->
      describe 'separated with camel casing', ->
        it 'returns values one level deep', -> expect(opts hash, 'settingsName').to.equal 'bob'
        it 'returns values two levels deep', -> expect(opts hash, 'settingsPathsHome').to.equal '/users'

      describe 'separated with dot', ->
        it 'returns values one level deep', -> expect(opts hash, 'settings.name').to.equal 'bob'
        it 'returns values two levels deep', -> expect(opts hash, 'settings.paths.home').to.equal '/users'

      describe 'separated with dash', ->
        it 'returns values one level deep', -> expect(opts hash, 'settings-name').to.equal 'bob'
        it 'returns values two levels deep', -> expect(opts hash, 'settings-paths-home').to.equal '/users'

      describe 'separated with underscore', ->
        it 'returns values one level deep', -> expect(opts hash, 'settings_name').to.equal 'bob'
        it 'returns values two levels deep', -> expect(opts hash, 'settings_paths_home').to.equal '/users'

      describe 'mixed separation', ->
        it 'returns values two levels deep using casing', -> expect(opts hash, 'settings_pathsHome').to.equal '/users'
        it 'returns values two levels deep and mixed name', -> expect(opts hash, 'settings_paths_systemLogs').to.equal '/logs'
        it 'returns values two levels deep and mixed names at multiple levels', -> expect(opts hash, 'settings_hostNames_remoteEnd').to.equal 'bob-remote'
