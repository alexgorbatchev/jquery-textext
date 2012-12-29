{ InputPlugin, UIPlugin, Plugin } = $.fn.textext

describe 'InputPlugin', ->
  plugin = parent = null

  beforeEach ->
    parent = new UIPlugin element : $ '<div class="parent">'
    plugin = new InputPlugin parent : parent

  it 'is registered', -> expect(Plugin.getRegistered 'input').toBe InputPlugin
  it 'has default options', -> expect(InputPlugin.defaults).toBeTruthy()

  describe 'instance', ->
    it 'is UIPlugin', -> expect(plugin instanceof UIPlugin).toBe true
    it 'is InputPlugin', -> expect(plugin instanceof InputPlugin).toBe true
    it 'adds itself to parent plugin', -> expect(parent.element).toContain plugin.element

  describe '.input', ->
    it 'returns DOM element', -> expect(plugin.input()).toBe 'input'

  describe '.value', ->
    beforeEach -> plugin.$('input').val('localhost')

    it 'returns input value', -> expect(plugin.value()).toBe 'localhost'

    it 'sets input value', ->
      plugin.value 'new value'
      expect(plugin.$('input').val()).toBe 'new value'
