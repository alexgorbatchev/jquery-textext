{ opts } = $.fn.textext

describe 'utils', ->
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

    it 'returns undefined without options', -> expect(opts null, 'version').toBe undefined
    it 'returns undefined when not found', -> expect(opts hash, 'invalid').toBe undefined
    it 'gets single word value', -> expect(opts hash, 'version').toBe 1
    it 'gets two word option', -> expect(opts hash, 'paramLength').toBe 10

    describe 'nested values', ->
      describe 'separated with camel casing', ->
        it 'gets values one level deep', -> expect(opts hash, 'settingsName').toBe 'bob'
        it 'gets values two levels deep', -> expect(opts hash, 'settingsPathsHome').toBe '/users'

      describe 'separated with dot', ->
        it 'gets values one level deep', -> expect(opts hash, 'settings.name').toBe 'bob'
        it 'gets values two levels deep', -> expect(opts hash, 'settings.paths.home').toBe '/users'

      describe 'separated with dash', ->
        it 'gets values one level deep', -> expect(opts hash, 'settings-name').toBe 'bob'
        it 'gets values two levels deep', -> expect(opts hash, 'settings-paths-home').toBe '/users'

      describe 'separated with underscore', ->
        it 'gets values one level deep', -> expect(opts hash, 'settings_name').toBe 'bob'
        it 'gets values two levels deep', -> expect(opts hash, 'settings_paths_home').toBe '/users'

      describe 'mixed separation', ->
        it 'gets values two levels deep using casing', -> expect(opts hash, 'settings_pathsHome').toBe '/users'
        it 'gets values two levels deep and mixed name', -> expect(opts hash, 'settings_paths_systemLogs').toBe '/logs'
        it 'gets values two levels deep and mixed names at multiple levels', -> expect(opts hash, 'settings_hostNames_remoteEnd').toBe 'bob-remote'
