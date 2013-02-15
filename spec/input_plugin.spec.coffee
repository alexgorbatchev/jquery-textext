{ InputPlugin, Plugin } = $.fn.textext

describe 'InputPlugin', ->
  plugin = null

  beforeEach ->
    plugin = new InputPlugin
      userOptions :
        completeKey : /400|knownkey|,/
        keys :
          500 : name : 'knownkey'
          501 : name : 'trappedkey', trap : true

  it 'is registered', -> expect(Plugin.getRegistered 'input').to.equal InputPlugin
  it 'has default options', -> expect(InputPlugin.defaults).to.be.ok

  describe 'instance', ->
    it 'is Plugin', -> expect(plugin).to.be.instanceof Plugin
    it 'is InputPlugin', -> expect(plugin).to.be.instanceof InputPlugin

  describe 'when known key is up', ->
    it 'fires `input.keyup.[keyName]` event', (done) ->
      plugin.on event: 'input.keyup.knownkey', handler: (keyCode) -> done()
      plugin.$onKeyUp keyCode: 500

    it 'fires `input.keyup` event', (done) ->
      plugin.on event: 'input.keyup', handler: (keyCode) -> done()
      plugin.$onKeyUp keyCode: 500

    it 'traps specified keys', -> expect(plugin.$onKeyUp keyCode: 501).to.be.false

  describe 'when unknown key is up', ->
    it 'fires `input.keyup` event', (done) ->
      plugin.on event: 'input.keyup', handler: (keyCode) -> done()
      plugin.$onKeyUp keyCode: 600

  describe 'when known key is down', ->
    it 'fires `input.keydown.[keyName]` event', (done) ->
      plugin.on event: 'input.keydown.knownkey', handler: (keyCode) -> done()
      plugin.$onKeyDown keyCode: 500

    it 'fires `input.keydown` event', (done) ->
      plugin.on event: 'input.keydown', handler: (keyCode) -> done()
      plugin.$onKeyDown keyCode: 500

    it 'traps specified keys', -> expect(plugin.$onKeyDown keyCode: 501).to.be.false

  describe 'when unknown key is down', ->
    it 'fires `input.keydown` event', (done) ->
      plugin.on event: 'input.keydown', handler: (keyCode) -> done()
      plugin.$onKeyDown keyCode: 600

  describe 'when known key is pressed', ->
    it 'fires `input.keypress.[keyName]` event', (done) ->
      plugin.on event: 'input.keypress.knownkey', handler: (keyCode) -> done()
      plugin.$onKeyPress keyCode: 500

    it 'fires `input.keypress` event', (done) ->
      plugin.on event: 'input.keypress', handler: (keyCode) -> done()
      plugin.$onKeyPress keyCode: 500

  describe 'when unknown key is pressed', ->
    it 'fires `input.keypress` event', (done) ->
      plugin.on event: 'input.keypress', handler: (keyCode) -> done()
      plugin.$onKeyPress keyCode: 600

  describe 'when complete key is down', ->
    it 'fires `input.complete` event for key code', (done) ->
      plugin.on event: 'input.complete', handler: (keyCode) -> done()
      plugin.$onKeyDown keyCode: 400

    it 'fires `input.complete` event for key name', (done) ->
      plugin.on event: 'input.complete', handler: (keyCode) -> done()
      plugin.$onKeyDown keyCode: 500

    it 'fires `input.complete` event for character', (done) ->
      plugin.on event: 'input.complete', handler: (keyCode) -> done()
      plugin.$onKeyDown keyCode: ','.charCodeAt 0

    it 'returns false to prevent key being typed', -> expect(plugin.$onKeyDown keyCode: 500).to.be.false

  describe '.input', ->
    it 'returns jQuery HTML element element', -> expect(plugin.input()).to.be 'input'

  describe '.value', ->
    beforeEach -> plugin.$('input').val('localhost')

    it 'returns input value', -> expect(plugin.value()).to.equal 'localhost'

    it 'sets input value', ->
      plugin.value 'new value'
      expect(plugin.$('input').val()).to.equal 'new value'
