{ InputPlugin, Plugin } = $.fn.textext

describe 'InputPlugin', ->
  plugin = null

  beforeEach ->
    plugin = new InputPlugin

  it 'is registered', -> expect(Plugin.getRegistered 'input').toBe InputPlugin
  it 'has default options', -> expect(InputPlugin.defaults).toBeTruthy()

  describe 'instance', ->
    it 'is Plugin', -> expect(plugin instanceof Plugin).toBe true
    it 'is InputPlugin', -> expect(plugin instanceof InputPlugin).toBe true

