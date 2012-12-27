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

  parent = plugin = child1 = child2 = null

  beforeEach ->
    parent = new Plugin element : $ '<div class="parent"/>'
    plugin = new Plugin parent : parent, element : $ '<div class="plugin"/>'
    child1 = new Plugin element : $ '<div class="child1"/>'
    child2 = new Plugin element : $ '<div class="child2"/>'

  describe '.addPlugin', ->
    beforeEach ->
      plugin.addPlugin 'child1', child1
      plugin.addPlugin 'child2', child2

    it 'adds another plugin to the plugin as a child', ->
      expect(plugin.plugins.child1).toBe child1
      expect(plugin.plugins.child2).toBe child2

  describe 'events', ->
    topLevel = null

    beforeEach ->
      topLevel = new Plugin element : $ '<div>'

      topLevel.addPlugin 'midlevel', plugin

      plugin.addPlugin 'child1', child1
      plugin.addPlugin 'child2', child2

    it 'broadcasts events to all siblings', -> expectEvent child2, 'event', -> child1.emit 'event'
    it 'bubbles events up', -> expectEvent topLevel, 'event', -> child2.emit 'event'

  describe '.appendToParent', ->
    beforeEach -> plugin.appendToParent()
    it 'appends own element to parent\'s', -> expect(parent.element).toContain plugin.element

  describe '.getPlugin', ->
    beforeEach ->
      plugin.addPlugin 'child1', child1
      plugin.addPlugin 'child2', child2

    it 'returns plugin when found', -> expect(plugin.getPlugin 'child1').toBe child1
    it 'returns null when not found', -> expect(plugin.getPlugin 'unknown').toBe undefined

  describe '.options', ->
    beforeEach ->
      plugin = new Plugin
        element        : $('<div/>')
        userOptions    : { host : 'localhost', blank : '' }
        defaultOptions : { path : '/usr', blank : 'fallback' }

    it 'returns default option value', -> expect(plugin.options 'path').toEqual '/usr'
    it 'returns user option value', -> expect(plugin.options 'host').toEqual 'localhost'
    it 'uses *defined* empty value', -> expect(plugin.options 'blank').toEqual ''

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

      plugin1 = plugin.plugins.plugin1
      plugin2 = plugin.plugins.plugin2

    it 'creates plugins', ->
      expect(plugin2 instanceof Plugin2).toBe true
      expect(plugin1 instanceof Plugin1).toBe true

    it 'passes options to plugin instances', -> expect(plugin2.options('host')).toBe 'localhost'

  describe '.init', ->
    beforeEach ->
      plugin = new Plugin
        element : $('<div>'),
        userOptions :
          plugins   : 'plugin1 plugin3 plugin2'
          registery : availablePlugins

      plugin.init()

    it 'creates plugins', ->
      expect(plugin.plugins.plugin1 instanceof Plugin1).toBe true
      expect(plugin.plugins.plugin2 instanceof Plugin2).toBe true
      expect(plugin.plugins.plugin3 instanceof Plugin3).toBe true
