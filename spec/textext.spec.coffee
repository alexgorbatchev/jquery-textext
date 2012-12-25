{ Plugin, TextExt } = $.fn.textext

describe 'TextExt', ->
  class Plugin1 extends Plugin
    constructor : -> super element : $('<div class="plugin1">')

  class Plugin2 extends Plugin
    constructor : -> super element : $('<div class="plugin2">')

  textext = element = availablePlugins = null

  beforeEach ->
    availablePlugins = { name1: Plugin1, name2: Plugin2 }
    textext = new TextExt $ '<div>'

  describe 'instance', ->
    it 'is Plugin', -> expect(textext instanceof Plugin).toBe true
    it 'is TextExt', -> expect(textext instanceof TextExt).toBe true

  describe 'jQuery plugin', ->
    select = $ '<select/>'
    it 'creates the plugin and returns correct chain', -> expect(select.textext().html()).toEqual select.html()
    it 'returns the plugin instance', -> expect(select.textext(instance : true) instanceof TextExt).toBe true
    it 'hides target element', expect(select).not.toBe ':visible'

  describe '.createPlugins', ->
    beforeEach -> textext.createPlugins 'name2 name1', availablePlugins

    it 'creates specified plugins in order using supplied list of available plugins', ->
      expect(textext.plugins[0] instanceof Plugin2).toBe true
      expect(textext.plugins[1] instanceof Plugin1).toBe true

    it 'adds plugin elements', ->
      expect(textext.element.children().length).toBe 2
      expect(textext.element).toContain '.plugin1'
      expect(textext.element).toContain '.plugin2'
