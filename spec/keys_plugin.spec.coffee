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

  describe 'when known key is up', ->
    beforeEach -> plugin.onKeyUp 500

    it 'fires specific up event', (done) -> plugin.on 'keys:up:knownkey', -> done()
    it 'fires generic up event', (done) -> plugin.on 'keys:up', -> done()
    it 'traps for known keys', -> expect(plugin.onKeyUp 501).to.be.false

  describe 'when unknown key is up', ->
    beforeEach -> plugin.onKeyUp 600

    it 'fires specific up event', (done) -> plugin.on 'keys:up:code:600', -> done()
    it 'fires generic up event', (done) -> plugin.on 'keys:up', -> done()

  describe 'when known key is down', ->
    beforeEach -> plugin.onKeyDown 500

    it 'fires specific down event', (done) -> plugin.on 'keys:down:knownkey', -> done()
    it 'fires generic down event', (done) -> plugin.on 'keys:down', -> done()
    it 'traps for known keys', -> expect(plugin.onKeyDown 501).to.be.false

  describe 'when unknown key is down', ->
    beforeEach -> plugin.onKeyDown 600

    it 'fires specific down event', (done) -> plugin.on 'keys:down:code:600', -> done()
    it 'fires generic down event', (done) -> plugin.on 'keys:down', -> done()

  describe 'when known key is pressed', ->
    beforeEach -> plugin.onKeyPress 500

    it 'fires specific press event', (done) -> plugin.on 'keys:press:knownkey', -> done()
    it 'fires generic press event', (done) -> plugin.on 'keys:press', -> done()

  describe 'when unknown key is pressed', ->
    beforeEach -> plugin.onKeyPress 600

    it 'fires specific press event', (done) -> plugin.on 'keys:press:code:600', -> done()
    it 'fires generic press event', (done) -> plugin.on 'keys:press', -> done()
