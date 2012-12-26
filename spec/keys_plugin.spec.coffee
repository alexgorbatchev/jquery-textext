{ KeysPlugin, Plugin } = $.fn.textext

describe 'KeysPlugin', ->
  plugin = null

  beforeEach ->
    plugin = new KeysPlugin
      userOptions :
        keys :
          500 : name : 'knownkey'
          501 : name : 'trappedkey', trap : true

  it 'is registered', -> expect(Plugin.registery['keys']).toBe KeysPlugin
  it 'has default options', -> expect(KeysPlugin.defaults).toBeTruthy()

  describe 'instance', ->
    it 'is Plugin', -> expect(plugin instanceof Plugin).toBe true
    it 'is KeysPlugins', -> expect(plugin instanceof KeysPlugin).toBe true

  describe 'key down event', ->
    it 'fires for known keys', -> expectEvent plugin, 'down.knownkey', -> plugin.onKeyDown 500
    it 'fires for unknown keys', -> expectEvent plugin, 'down.code.600', -> plugin.onKeyDown 600
    it 'traps for known keys', -> expect(plugin.onKeyDown 501).toBe false

  describe 'key up event', ->
    it 'fires for known keys', -> expectEvent plugin, 'up.knownkey', -> plugin.onKeyUp 500
    it 'fires for unknown keys', -> expectEvent plugin, 'up.code.600', -> plugin.onKeyUp 600
    it 'traps for known keys', -> expect(plugin.onKeyUp 501).toBe false

  describe 'key press event', ->
    it 'fires for known keys', ->
      expectEvent plugin, 'press.knownkey', ->
        plugin.onKeyDown 500
        plugin.onKeyUp 500

    it 'fires for unknown keys', ->
      expectEvent plugin, 'press.code.600', ->
        plugin.onKeyDown 600
        plugin.onKeyUp 600
