{ AutocompletePlugin, InputPlugin, ItemsManager, Plugin } = $.fn.textext

describe 'AutocompletePlugin', ->
  html = -> console.log plugin.element.html()

  expectSelected = (item) -> expect(plugin.$(".textext-items-item:contains(#{item})")).to.match '.selected'

  downKey = (done) ->
    plugin.onDownKey()
    expect(plugin.select).to.be.called done

  upKey = (done) ->
    plugin.onUpKey()
    expect(plugin.select).to.be.called done

  escKey = (done) ->
    plugin.onEscKey()
    expect(plugin.hide).to.be.called done

  expectItems = (items) ->
    actual = []
    plugin.$('.textext-items-item .textext-items-label').each -> actual.push $(@).text().replace(/^\s+|\s+$/g, '')
    expect(actual.join ' ').to.equal items

  plugin = input = null

  beforeEach ->
    input = new InputPlugin
    plugin = new AutocompletePlugin parent : input

    # plugin.once 'items.set', -> done()

  it 'is registered', -> expect(Plugin.getRegistered 'autocomplete').to.equal AutocompletePlugin
  it 'has default options', -> expect(AutocompletePlugin.defaults).to.be.ok

  describe 'instance', ->
    it 'is Plugin', -> expect(plugin).to.be.instanceof Plugin
    it 'is AutocompletePlugin', -> expect(plugin).to.be.instanceof AutocompletePlugin

    describe 'with parent', ->
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

  describe '.show', ->
    it 'shows the dropdown', (done) ->
      plugin.show ->
        expect(plugin.visible()).to.be.true
        done()

  describe '.hide', ->
    beforeEach (done) -> plugin.hide done

    it 'hides the dropdown', -> expect(plugin.visible()).to.be.false
    it 'deselects selected item', -> expect(plugin.selectedIndex()).to.equal -1

  describe '.select', ->
    beforeEach (done) ->
      plugin.setItems [ 'item1', 'item2', 'foo', 'bar' ], ->
        plugin.element.show()
        done()

    it 'selects first element by index', ->
      plugin.select 0
      expectSelected 'item1'

    it 'selects specified element by index', ->
      plugin.select 2
      expectSelected 'foo'

  describe '.selectedIndex', ->
    beforeEach (done) -> plugin.setItems [ 'item1', 'item2', 'foo', 'bar' ], done

    describe 'when dropdown is not visible', ->
      it 'returns -1', -> expect(plugin.selectedIndex()).to.equal -1

    describe 'when dropdown is visible', ->
      it 'returns 0 when first item is selected', ->
        plugin.$('.textext-items-item:eq(0)').addClass 'selected'
        expect(plugin.selectedIndex()).to.equal 0

      it 'returns 3 when fourth item is selected', ->
        plugin.$('.textext-items-item:eq(3)').addClass 'selected'
        expect(plugin.selectedIndex()).to.equal 3

  describe '.onDownKey', ->
    beforeEach (done) ->
      spy plugin, 'select'
      plugin.setItems [ 'item1', 'item2', 'foo', 'bar' ], done

    describe 'when there is text', ->
      beforeEach (done) ->
        input.value 'item'
        downKey done

      describe 'dropdown', ->
        it 'is visible', -> expect(plugin.visible()).to.be.true
        it 'has items matching text', -> expectItems 'item1 item2'

    describe 'when there is no text', ->
      beforeEach (done) -> downKey done

      describe 'dropdown', ->
        it 'is visible', -> expect(plugin.visible()).to.be.true
        it 'has all original items', -> expectItems 'item1 item2 foo bar'

    describe 'pressing once', ->
      it 'selects the first item', (done) ->
        downKey ->
          expectSelected 'item1'
          done()

    describe 'pressing twice', ->
      it 'selects the the second item', (done) ->
        downKey -> downKey ->
          expectSelected 'item2'
          done()

    describe 'pressing three times', ->
      it 'selects the the third item', (done) ->
        downKey -> downKey -> downKey ->
          expectSelected 'foo'
          done()

    describe 'pressing four times', ->
      it 'selects the the fourth item', (done) ->
        downKey -> downKey -> downKey -> downKey ->
          expectSelected 'bar'
          done()

    describe 'pressing five times', ->
      it 'keeps selection on the the fourth item', (done) ->
        downKey -> downKey -> downKey -> downKey -> downKey ->
          expectSelected 'bar'
          done()

  describe '.onUpKey', ->
    beforeEach (done) ->
      spy plugin, 'select'

      plugin.setItems [ 'item1', 'item2', 'foo', 'bar' ], ->
        downKey -> downKey -> downKey ->
          expectSelected 'foo'
          done()

    describe 'pressing once', ->
      it 'selects the first item', (done) ->
        upKey ->
          expectSelected 'item2'
          done()

    describe 'pressing twice', ->
      it 'selects the the second item', (done) ->
        upKey -> upKey ->
          expectSelected 'item1'
          done()

    describe 'pressing three times', ->
      it 'goes back into the input', (done) ->
        spy input, 'focus'

        upKey -> upKey -> upKey ->
          expect(plugin.selectedIndex()).to.equal -1
          expect(input.focus).to.be.called done

  describe '.onEscKey', ->
    beforeEach (done) ->
      spy plugin, 'hide'
      plugin.setItems [ 'item1', 'item2', 'foo', 'bar' ], -> plugin.show(-> done())

    it 'closes the drop down', (done) ->
      escKey -> expect(plugin.hide).to.be.called done

    it 'focuses on the input field', (done) ->
      spy input, 'focus'
      escKey -> expect(input.focus).to.be.called done

  describe '.onAnyKeyDown', ->

    it 'respects `minLength` option', ->
      spy plugin, 'invalidate'

    beforeEach ->
