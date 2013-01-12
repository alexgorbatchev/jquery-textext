{ InputPlugin, UIPlugin, Plugin } = $.fn.textext

describe 'InputPlugin', ->
  plugin = null

  beforeEach -> plugin = new InputPlugin

  it 'is registered', -> expect(Plugin.getRegistered 'input').to.equal InputPlugin
  it 'has default options', -> expect(InputPlugin.defaults).to.be.ok

  describe 'instance', ->
    it 'is UIPlugin', -> expect(plugin).to.be.instanceof UIPlugin
    it 'is InputPlugin', -> expect(plugin).to.be.instanceof InputPlugin

  describe '.input', ->
    it 'returns DOM element', -> expect(plugin.input()).to.be 'input'

  describe '.value', ->
    beforeEach -> plugin.$('input').val('localhost')

    it 'returns input value', -> expect(plugin.value()).to.equal 'localhost'

    it 'sets input value', ->
      plugin.value 'new value'
      expect(plugin.$('input').val()).to.equal 'new value'
