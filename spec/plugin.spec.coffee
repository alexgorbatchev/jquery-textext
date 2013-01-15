{ Plugin } = $.fn.textext

describe 'Plugin', ->
  class Plugin1 extends Plugin
  class Plugin2 extends Plugin
  class Plugin3 extends Plugin

  availablePlugins =
    plugin1 : Plugin1
    plugin2 : Plugin2
    plugin3 : Plugin3

  parent = plugin = null

  beforeEach ->
    parent = new Plugin
    plugin = new Plugin parent : parent

  describe '.getPlugin', ->
    child = null

    beforeEach ->
      child = new Plugin
      plugin.plugins = { child }

    it 'returns plugin when found', -> expect(plugin.getPlugin 'child').to.equal child
    it 'returns null when not found', -> expect(plugin.getPlugin 'unknown').to.not.be.ok

  describe '.options', ->
    beforeEach ->
      plugin = new Plugin
        element        : $('<div/>')
        userOptions    : { host : 'localhost', blank : '' }
        defaultOptions : { path : '/usr', blank : 'fallback' }

    it 'returns default option value', -> expect(plugin.options 'path').to.equal '/usr'
    it 'returns user option value', -> expect(plugin.options 'host').to.equal 'localhost'
    it 'uses *defined* empty value', -> expect(plugin.options 'blank').to.equal ''

  describe '.createPlugins', ->
    plugin1 = plugin2 = null

    beforeEach ->
      plugin = new Plugin
        userOptions :
          registery : availablePlugins

          plugin2 :
            host : 'localhost'

      { plugin1, plugin2 } = plugin.createPlugins 'plugin2 plugin1'

    it 'creates plugins', ->
      expect(plugin2).to.be.instanceof Plugin2
      expect(plugin1).to.be.instanceof Plugin1

    it 'passes options to plugin instances', -> expect(plugin2.options('host')).to.equal 'localhost'
