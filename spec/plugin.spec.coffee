{ Plugin } = $.fn.textext

describe 'Plugin', ->
  plugin = null

  beforeEach ->
    plugin = new Plugin()

  describe '.addPlugin', ->
    child = null

    beforeEach ->
      child = new Plugin()
      plugin.addPlugin child

    it 'adds another plugin', -> expect(child.core).toBe plugin

  describe '.option', ->
    beforeEach - >
      plugin = new Plugin
        { host : 'localhost' },
        { path : '/usr' }

    it 'returns user option value', -> expect(plugin.option 'host').toBe 'localhost'
    it 'returns default option value', -> expect(plugin.option 'path').toBe '/usr'
