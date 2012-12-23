{ KeysPlugin, Plugin } = $.fn.textext

describe 'KeysPlugin', ->
  plugin = null

  it 'is registered', -> expect(Plugin.registery['keys']).toBe KeysPlugin

  describe 'instance', ->
    beforeEach -> plugin = new KeysPlugin()

    it 'is Plugin', -> expect(plugin instanceof Plugin).toBe true
    it 'is KeysPlugins', -> expect(plugin instanceof KeysPlugin).toBe true

