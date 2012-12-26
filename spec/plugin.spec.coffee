{ Plugin } = $.fn.textext

describe 'Plugin', ->
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
