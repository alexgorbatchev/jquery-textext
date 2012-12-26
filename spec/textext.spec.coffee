{ Plugin, TextExt } = $.fn.textext

describe 'TextExt', ->
  class Plugin1 extends Plugin
    constructor : (opts) ->
      super(opts)
      @element = $('<div class="plugin1">')

  class Plugin2 extends Plugin
    constructor : (opts) ->
      super(opts)
      @element = $('<div class="plugin2">')

  class Plugin3 extends Plugin
    constructor : (opts) ->
      super(opts)
      @element = $('<div class="plugin3">')

  availablePlugins =
    plugin1 : Plugin1
    plugin2 : Plugin2
    plugin3 : Plugin3

  textext = null

  describe 'instance', ->
    beforeEach -> textext = new TextExt $('<div>')
    it 'is Plugin', -> expect(textext instanceof Plugin).toBe true
    it 'is TextExt', -> expect(textext instanceof TextExt).toBe true

  describe 'jQuery plugin', ->
    select = $ '<select/>'
    it 'creates the plugin and returns correct chain', -> expect(select.textext().html()).toEqual select.html()
    it 'returns the plugin instance', -> expect(select.textext(instance : true) instanceof TextExt).toBe true
    it 'hides target element', -> expect(select).not.toBe ':visible'

  describe '.createPlugins', ->
    plugin1 = plugin2 = null

    beforeEach ->
      textext = new TextExt $('<div>'),
        userOptions :
          autoPlugins      : ''
          availablePlugins : availablePlugins

          plugin2 :
            host : 'localhost'

      textext.createPlugins 'plugin2 plugin1'

      plugin1 = textext.plugins[1]
      plugin2 = textext.plugins[0]

    it 'creates specified plugins in order using supplied list of available plugins', ->
      expect(plugin2 instanceof Plugin2).toBe true
      expect(plugin1 instanceof Plugin1).toBe true

    it 'adds plugin elements', ->
      expect(textext.element.children().length).toBe 2
      expect(textext.element).toContain '.plugin1'
      expect(textext.element).toContain '.plugin2'

    it 'passes options to plugin instances', -> expect(plugin2.options('host')).toBe 'localhost'

  describe 'startup behaviour', ->
    beforeEach ->
      textext = new TextExt $('<div>'),
        userOptions :
          autoPlugins      : 'plugin1'
          plugins          : 'plugin3 plugin2'
          availablePlugins : availablePlugins

    it 'creates plugins based on the `autoPlugins` option value', ->
      expect(textext.plugins[0] instanceof Plugin1).toBe true

    it 'creates plugins based on the `plugin` option value', ->
      expect(textext.plugins[1] instanceof Plugin3).toBe true
      expect(textext.plugins[2] instanceof Plugin2).toBe true
