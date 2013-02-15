{ AutocompletePlugin, InputPlugin, ItemsManager, Plugin, series } = $.fn.textext

describe 'AutocompletePlugin', ->
  onDownKey = -> plugin.onDownKey 0
  onUpKey = -> plugin.onUpKey 0

  expectSelected = (item) -> expect(plugin.$(".textext-items-item:contains(#{item})")).to.match '.textext-items-selected'

  expectItems = (items) ->
    actual = []
    plugin.$('.textext-items-item .textext-items-label').each -> actual.push $(@).text().replace(/^\s+|\s+$/g, '')
    expect(actual.join ' ').to.equal items

  plugin = input = null

  beforeEach ->
    input = new InputPlugin
    plugin = new AutocompletePlugin parent : input

  it 'is registered', -> expect(Plugin.getRegistered 'autocomplete').to.equal AutocompletePlugin
  it 'has default options', -> expect(AutocompletePlugin.defaults).to.be.ok

  describe 'instance', ->
    it 'is Plugin', -> expect(plugin).to.be.instanceof Plugin
    it 'is AutocompletePlugin', -> expect(plugin).to.be.instanceof AutocompletePlugin

    describe 'parent', ->
      it 'adds itself to parent', -> expect(plugin.element.parent()).to.be input.element
      it 'only works with InputPlugin', ->
        parent = new Plugin element : $ '<div>'
        expect(-> new AutocompletePlugin parent : parent).to.throw 'Expects InputPlugin parent'

  describe '.items', ->
    it 'returns instance of `ItemsManager` plugin', -> expect(plugin.items).to.be.instanceof ItemsManager

  describe '.visible', ->
    it 'returns `true` when dropdown is visible', ->
      plugin.element.show()
      expect(plugin.visible()).to.be.true

    it 'returns `false` when dropdown is not visible', ->
      plugin.element.hide()
      expect(plugin.visible()).to.be.false

  describe '.invalidate', ->
    beforeEach (done) ->
      plugin.setItems([ 'hello', 'world' ]).done -> done()

    it 'shows `no results` when there are no items to display', (done) ->
      input.value '?'
      plugin.invalidate().done ->
        expect(plugin.element.find '.textext-autocomplete-no-results').to.be.exist
        done()

    it 'hides `no results` message when there are items to display', (done) ->
      input.value '?'
      plugin.invalidate().done ->
        input.value 'h'
        plugin.invalidate().done ->
          expect(plugin.element.find '.textext-autocomplete-no-results').to.not.exist
          done()

  describe '.show', ->
    beforeEach (done) ->
      plugin.setItems([ 'hello', 'world' ]).done -> done()

    it 'shows the dropdown when there are items to display', (done) ->
      input.value 'h'
      plugin.show().done ->
        expect(plugin.visible()).to.be.true
        expectItems 'hello'
        done()

  describe '.hide', ->
    beforeEach (done) ->
      plugin.hide().done -> done()

    it 'hides the dropdown', -> expect(plugin.visible()).to.be.false
    it 'deselects selected item', -> expect(plugin.selectedIndex()).to.equal -1

  describe '.complete', ->
    beforeEach (done) ->
      plugin.setItems([ 'item1', 'item2', 'foo', 'bar' ]).done ->
        done()

    describe 'when dropdown is visible', ->
      beforeEach (done) ->
        plugin.show().done ->
          done()

      it 'uses selected item to set the value', (done) ->
        expect(input.value()).to.equal ''
        plugin.$('.textext-items-item:eq(1)').addClass 'textext-items-selected'

        plugin.complete().done ->
          expect(input.value()).to.equal 'item2'
          done()

      it 'does nothing if no item is selected', (done) ->
        plugin.complete().done ->
          expect(input.value()).to.equal ''
          done()

  describe '.onDownKey', ->
    beforeEach (done) ->
      plugin.setItems([ 'item1', 'item2', 'foo', 'bar' ]).done -> done()

    describe 'when there is text', ->
      beforeEach (done) ->
        input.value 'item'
        onDownKey().done ->
          done()

      describe 'dropdown', ->
        it 'is visible', -> expect(plugin.visible()).to.be.true
        it 'has items matching text', -> expectItems 'item1 item2'

    describe 'when there is no text', ->
      beforeEach (done) ->
        onDownKey().done ->
          done()

      describe 'dropdown', ->
        it 'is visible', -> expect(plugin.visible()).to.be.true
        it 'has all original items', -> expectItems 'item1 item2 foo bar'

    describe 'pressing once', ->
      it 'selects the first item', (done) ->
        onDownKey().done ->
          expectSelected 'item1'
          done()

    describe 'pressing twice', ->
      it 'selects the the second item', (done) ->
        series(onDownKey(), onDownKey()).done ->
          expectSelected 'item2'
          done()

    describe 'pressing three times', ->
      it 'selects the the third item', (done) ->
        series(onDownKey(), onDownKey(), onDownKey()).done ->
          expectSelected 'foo'
          done()

    describe 'pressing four times', ->
      it 'selects the the fourth item', (done) ->
        series(onDownKey(), onDownKey(), onDownKey(), onDownKey()).done ->
          expectSelected 'bar'
          done()

    describe 'pressing five times', ->
      it 'keeps selection on the the fourth item', (done) ->
        series(onDownKey(), onDownKey(), onDownKey(), onDownKey(), onDownKey()).done ->
          expectSelected 'bar'
          done()

  describe '.onUpKey', ->
    beforeEach (done) ->
      plugin.setItems([ 'item1', 'item2', 'foo', 'bar' ]).done ->
        series(onDownKey(), onDownKey(), onDownKey()).done ->
          expectSelected 'foo'
          done()

    describe 'pressing once', ->
      it 'selects the first item', (done) ->
        onUpKey().done ->
          expectSelected 'item2'
          done()

    describe 'pressing twice', ->
      it 'selects the the second item', (done) ->
        series(onUpKey(), onUpKey()).done ->
          expectSelected 'item1'
          done()

    describe 'pressing three times', ->
      it 'goes back into the input', (done) ->
        series(onUpKey(), onUpKey(), onUpKey()).done ->
          expect(plugin.selectedIndex()).to.equal -1
          done()

  describe '.onEscKey', ->
    beforeEach (done) ->
      series(plugin.setItems([ 'item1', 'item2', 'foo', 'bar' ]), plugin.show()).done ->
        done()

    it 'closes the drop down', (done) ->
      plugin.onEscKey(0).done ->
        expect(plugin.visible()).to.be.false
        done()

  describe '.onInputChange', ->
    beforeEach (done) ->
      plugin.setItems([ 'hello', 'world' ]).done -> done()

    it 'respects `minLength` option when there is value in the input box', (done) ->
      input.value 'w'
      plugin.userOptions.minLength = 2
      plugin.onInputChange().done ->
        expect(plugin.visible()).to.be.false
        done()

    it 'shows the dropdown', (done) ->
      input.value 'wor'

      plugin.onInputChange().done ->
        expectItems 'world'
        expect(plugin.visible()).to.be.true
        done()

  describe '.$onItemClick', ->
    beforeEach (done) ->
      plugin.setItems([ 'hello', 'world' ]).done ->
        plugin.show().done ->
          done()

    it 'selects clicked item and completes the autocomplete', (done) ->
      item = plugin.$(".textext-items-item:eq(1)")
      plugin.$onItemClick({ target: item }).done ->
        expect(input.value()).to.equal 'world'
        done()

