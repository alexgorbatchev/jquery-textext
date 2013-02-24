{ Plugin } = $.fn.textext

describe 'Plugin', ->
  class Plugin1 extends Plugin
    @pluginName = 'plugin1'

  class Plugin2 extends Plugin
    @pluginName = 'plugin2'

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
    describe 'given a space separated string', ->
      plugin1 = plugin2 = null

      beforeEach ->
        plugin.userOptions =
          registery : availablePlugins
          plugin2 : host : 'localhost'

        { plugin1, plugin2 } = plugin.createPlugins 'plugin2 plugin1'

      it 'creates plugins from plugin registery', ->
        expect(plugin1).to.be.instanceof Plugin1
        expect(plugin2).to.be.instanceof Plugin2

      it 'passes options to plugin instances', ->
        expect(plugin2.options('host')).to.equal 'localhost'

    describe 'given an array of constructors', ->
      plugin1 = plugin2 = null

      beforeEach ->
        plugin.userOptions =
          plugin2 : host : 'localhost'

        { plugin1, plugin2 } = plugin.createPlugins [ Plugin1, Plugin2 ]

      it 'creates plugins', ->
        expect(plugin1).to.be.instanceof Plugin1
        expect(plugin2).to.be.instanceof Plugin2

      it 'expects constructor to have static `name` property', ->
        expect(-> plugin.createPlugins [ Plugin3 ]).to.throw

      it 'passes options to plugin instances', ->
        expect(plugin2.options('host')).to.equal 'localhost'

    describe 'given one constructors', ->
      plugin1 = null

      beforeEach ->
        plugin1 = plugin.createPlugins Plugin1

      it 'creates plugin', ->
        expect(plugin1).to.be.instanceof Plugin1
