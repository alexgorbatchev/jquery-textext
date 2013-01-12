{ KeysPlugin, Plugin } = $.fn.textext

describe 'KeysPlugin', ->
  plugin = null

  beforeEach ->
    plugin = new KeysPlugin
      element : $ '<div>'
      userOptions :
        keys :
          500 : name : 'knownkey'
          501 : name : 'trappedkey', trap : true

  it 'is registered', -> expect(Plugin.getRegistered 'keys').to.equal KeysPlugin
  it 'has default options', -> expect(KeysPlugin.defaults).to.be.ok

  describe 'instance', ->
    it 'is Plugin', -> expect(plugin).to.be.instanceof Plugin
    it 'is KeysPlugins', -> expect(plugin).to.be.instanceof KeysPlugin

  describe 'key down event', ->
    it 'fires for known keys', (done) ->
      plugin.on 'keys.down.knownkey', -> done()
      plugin.onKeyDown 500

    it 'fires for unknown keys', (done) ->
      plugin.on 'keys.down.code.600', -> done()
      plugin.onKeyDown 600

    it 'traps for known keys', -> expect(plugin.onKeyDown 501).to.be.false

  describe 'key up event', ->
    it 'fires for known keys', (done) ->
      plugin.on 'keys.up.knownkey', -> done()
      plugin.onKeyUp 500

    it 'fires for unknown keys', (done) ->
      plugin.on 'keys.up.code.600', -> done()
      plugin.onKeyUp 600

    it 'traps for known keys', -> expect(plugin.onKeyUp 501).to.be.false

  describe 'key press event', ->
    it 'fires for known keys', (done) ->
      plugin.on 'keys.press.knownkey', -> done()
      plugin.onKeyDown 500
      plugin.onKeyUp 500

    it 'fires for unknown keys', (done) ->
      plugin.on 'keys.press.code.600', -> done()
      plugin.onKeyDown 600
      plugin.onKeyUp 600
