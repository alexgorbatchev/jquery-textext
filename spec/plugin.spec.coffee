{ Plugin } = $.fn.textext

describe 'Plugin', ->
  plugin = child = null

  beforeEach ->
    plugin = new Plugin
    child = new Plugin

  describe '.addPlugin', ->
    beforeEach -> plugin.addPlugin child

    it 'adds another plugin', -> expect(plugin.plugins[0]).toBe child

  describe '.option', ->
    beforeEach ->
      plugin = new Plugin { host : 'localhost' }, { path : '/usr' }

    it 'returns default option value', -> expect(plugin.option 'path').toEqual '/usr'
    it 'returns user option value', -> expect(plugin.option 'host').toEqual 'localhost'

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