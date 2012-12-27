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

  describe '.input', ->
    it 'returns DOM element', -> expect(plugin.input()).toBe 'input'

  describe '.value', ->
    beforeEach -> plugin.$('input').val('localhost')

    it 'returns input value', -> expect(plugin.value()).toBe 'localhost'

    it 'sets input value', ->
      plugin.value 'new value'
      expect(plugin.$('input').val()).toBe 'new value'
