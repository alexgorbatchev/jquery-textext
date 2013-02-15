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

    document.body.appendChild plugin.element[0]

  afterEach ->
    document.body.removeChild plugin.element[0]

  it 'is registered', -> expect(Plugin.getRegistered 'input').to.equal InputPlugin
  it 'has default options', -> expect(InputPlugin.defaults).to.be.ok

  describe 'instance', ->
    it 'is Plugin', -> expect(plugin).to.be.instanceof Plugin
    it 'is InputPlugin', -> expect(plugin).to.be.instanceof InputPlugin

  describe 'keyboard event', ->
    describe 'on key up', ->
      describe 'and key is known', ->
        it 'fires `input.keyup.[keyName]` event', (done) ->
          plugin.on event: 'input.keyup.knownkey', handler: (keyCode) -> done()
          plugin.$onKeyUp keyCode: 500

        it 'fires `input.keyup` event', (done) ->
          plugin.on event: 'input.keyup', handler: (keyCode) -> done()
          plugin.$onKeyUp keyCode: 500

        it 'traps specified keys', -> expect(plugin.$onKeyUp keyCode: 501).to.be.false

      describe 'and key is unknown', ->
        it 'fires `input.keyup` event', (done) ->
          plugin.on event: 'input.keyup', handler: (keyCode) -> done()
          plugin.$onKeyUp keyCode: 600

    describe 'on key down', ->
      describe 'and key is known', ->
        it 'fires `input.keydown.[keyName]` event', (done) ->
          plugin.on event: 'input.keydown.knownkey', handler: (keyCode) -> done()
          plugin.$onKeyDown keyCode: 500

        it 'fires `input.keydown` event', (done) ->
          plugin.on event: 'input.keydown', handler: (keyCode) -> done()
          plugin.$onKeyDown keyCode: 500

        it 'traps specified keys', -> expect(plugin.$onKeyDown keyCode: 501).to.be.false

      describe 'and key is unknown', ->
        it 'fires `input.keydown` event', (done) ->
          plugin.on event: 'input.keydown', handler: (keyCode) -> done()
          plugin.$onKeyDown keyCode: 600

    describe 'on key press', ->
      describe 'and key is known', ->
        it 'fires `input.keypress.[keyName]` event', (done) ->
          plugin.on event: 'input.keypress.knownkey', handler: (keyCode) -> done()
          plugin.$onKeyPress keyCode: 500

        it 'fires `input.keypress` event', (done) ->
          plugin.on event: 'input.keypress', handler: (keyCode) -> done()
          plugin.$onKeyPress keyCode: 500

      describe 'and key is unknown', ->
        it 'fires `input.keypress` event', (done) ->
          plugin.on event: 'input.keypress', handler: (keyCode) -> done()
          plugin.$onKeyPress keyCode: 600

    describe 'on complete key', ->
      it 'fires `input.complete` event for key code', (done) ->
        plugin.on event: 'input.complete', handler: (keyCode) -> done()
        plugin.$onKeyDown keyCode: 400

      it 'fires `input.complete` event for key name', (done) ->
        plugin.on event: 'input.complete', handler: (keyCode) -> done()
        plugin.$onKeyDown keyCode: 500

      it 'fires `input.complete` event for character', (done) ->
        plugin.on event: 'input.complete', handler: (keyCode) -> done()
        plugin.$onKeyDown charCode: ','.charCodeAt 0

      it 'returns false to prevent key being typed', -> expect(plugin.$onKeyDown keyCode: 500).to.be.false

  describe '.keyInfo', ->
    it 'summarizes information from keyboard event into an object', ->
      actual = plugin.keyInfo
        keyCode  : 501
        charCode : 42

      expect(actual).to.eql
        code : 501
        char : '*'
        name : 'trappedkey'
        trap : true

  describe '.isCompleteKey', ->
    it 'returns `true` if key details match `completeKey` option', ->
      expect(plugin.isCompleteKey code : 400).to.be.true
      expect(plugin.isCompleteKey char : ',').to.be.true
      expect(plugin.isCompleteKey name : 'knownkey').to.be.true

  describe '.input', ->
    it 'returns jQuery HTML element element', -> expect(plugin.input()).to.be 'input'

  describe '.empty', ->
    it 'returns `true` if input value is empty', ->
      expect(plugin.empty()).to.be.true

    it 'returns `false` if there is text in the input', ->
      plugin.value 'text'
      expect(plugin.empty()).to.be.false

  describe '.caretPosition', ->
    it 'returns position of the user carret in the input box', ->
      plugin.value 'text'
      plugin.input().get(0).selectionStart = 2
      console.log plugin.caretPosition(), plugin.value().length
      expect(plugin.caretPosition()).to.equal 2

  describe '.caretAtEnd', ->
    beforeEach -> plugin.value 'text'

    it 'returns `true` if user caret is at the last character in the input box', ->
      plugin.input().get(0).selectionStart = 4
      expect(plugin.caretAtEnd()).to.be.true

    it 'returns `false` if user caret is not at the last character in the input box', ->
      plugin.input().get(0).selectionStart = 2
      console.log plugin.caretPosition(), plugin.value().length
      expect(plugin.caretAtEnd()).to.be.false

  describe '.value', ->
    beforeEach -> plugin.$('input').val('localhost')

    it 'returns input value', -> expect(plugin.value()).to.equal 'localhost'

    it 'sets input value', ->
      plugin.value 'new value'
      expect(plugin.$('input').val()).to.equal 'new value'
