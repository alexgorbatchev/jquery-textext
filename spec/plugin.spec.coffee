{ Plugin } = $.fn.textext

describe 'Plugin', ->
  plugin = child = null

  beforeEach ->
    plugin = new Plugin element : $ '<div class="plugin"/>'
    child = new Plugin element : $ '<div class="child"/>'

  describe '.addPlugin', ->
    beforeEach -> plugin.addPlugin child

    it 'adds another plugin to the plugin as a child', -> expect(plugin.plugins[0]).toBe child
    it 'adds child\'s element to the plugin element', -> expect(plugin.element).toContain 'div.child'
    it 'adds `textext-plugin` class to the child\'s element', -> expect(child.element).toBe '.textext-plugin'

  describe '.options', ->
    beforeEach ->
      plugin = new Plugin
        element        : $('<div/>')
        userOptions    : { host : 'localhost' }
        defaultOptions : { path : '/usr' }

    it 'returns default option value', -> expect(plugin.options 'path').toEqual '/usr'
    it 'returns user option value', -> expect(plugin.options 'host').toEqual 'localhost'

  describe 'events', ->
    scope =
    beforeEach ->
      scope = callback : -> null
      spyOn scope, 'callback'
      plugin.addPlugin child

    it 'bubbles events from child plugins', ->
      plugin.on 'event', scope.callback
      child.emit 'event'

      expect(scope.callback).toHaveBeenCalled()