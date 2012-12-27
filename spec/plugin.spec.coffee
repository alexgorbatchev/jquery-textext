{ Plugin } = $.fn.textext

describe 'Plugin', ->
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

  plugin = child1 = child2 = null

  beforeEach ->
    plugin = new Plugin element : $ '<div class="plugin"/>'
    child1 = new Plugin element : $ '<div class="child1"/>'
    child2 = new Plugin element : $ '<div class="child2"/>'

  describe '.addPlugin', ->
    beforeEach ->
      plugin.addPlugin 'child1', child1
      plugin.addPlugin 'child2', child2

    it 'adds another plugin to the plugin as a child', ->
      expect(plugin.plugins[0]).toBe child1
      expect(plugin.plugins[1]).toBe child2

    it 'adds child\'s element to the plugin element', ->
      expect(plugin.element).toContain 'div.child1'
      expect(plugin.element).toContain 'div.child2'

    it 'adds `textext-plugin` class to the child\'s element', ->
      expect(child1.element).toBe '.textext-plugin'
      expect(child2.element).toBe '.textext-plugin'

  describe '.options', ->
    beforeEach ->
      plugin = new Plugin
        element        : $('<div/>')
        userOptions    : { host : 'localhost', blank : '' }
        defaultOptions : { path : '/usr', blank : 'fallback' }

    it 'returns default option value', -> expect(plugin.options 'path').toEqual '/usr'
    it 'returns user option value', -> expect(plugin.options 'host').toEqual 'localhost'
    it 'uses *defined* empty value', -> expect(plugin.options 'blank').toEqual ''

  describe 'events', ->
    beforeEach ->
      plugin.addPlugin 'child1', child1
      plugin.addPlugin 'child2', child2

    it 'broadcasts events emitted by a plugin to all other plugins', -> expectEvent child2, 'child1.event', -> child1.emit 'event'

  describe '.createPlugins', ->
    plugin1 = plugin2 = null

    beforeEach ->
      plugin = new Plugin
        element : $ '<div>'
        userOptions :
          registery : availablePlugins

          plugin2 :
            host : 'localhost'

      plugin.createPlugins 'plugin2 plugin1'

      plugin1 = plugin.plugins[1]
      plugin2 = plugin.plugins[0]

    it 'creates plugins in order', ->
      expect(plugin2 instanceof Plugin2).toBe true
      expect(plugin1 instanceof Plugin1).toBe true

    it 'adds plugin elements', ->
      expect(plugin.element.children().length).toBe 2
      expect(plugin.element).toContain '.plugin1'
      expect(plugin.element).toContain '.plugin2'

    it 'passes options to plugin instances', -> expect(plugin2.options('host')).toBe 'localhost'

  describe '.init', ->
    beforeEach ->
      plugin = new Plugin
        element : $('<div>'),
        userOptions :
          plugins   : 'plugin1 plugin3 plugin2'
          registery : availablePlugins

      plugin.init()

    it 'creates `init` plugins', ->
      expect(plugin.plugins[0] instanceof Plugin1).toBe true

    it 'creates `user` plugins', ->
      expect(plugin.plugins[1] instanceof Plugin3).toBe true
      expect(plugin.plugins[2] instanceof Plugin2).toBe true
