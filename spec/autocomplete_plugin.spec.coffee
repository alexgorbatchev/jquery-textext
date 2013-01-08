{ AutocompletePlugin, InputPlugin, ItemsManager, UIPlugin, Plugin } = $.fn.textext

describe 'AutocompletePlugin', ->
  html = -> console.log plugin.element.html()

  setItems       = (items) -> waitsForCallback (done) -> plugin.setItems items, done

  expectSelected = (item) -> expect(plugin.$(".textext-items-item:contains(#{item})")).toBe '.selected'

  # expectItem = (item) -> expect(plugin.$(".textext-items-item:contains(#{item})").length > 0)

  expectItems = (items) ->
    actual = []
    plugin.$('.textext-items-item .textext-items-label').each -> actual.push $(@).text().replace(/^\s+|\s+$/g, '')
    expect(actual.join ' ').toBe items

  plugin = input = null

  beforeEach ->
    input = new InputPlugin
    plugin = new AutocompletePlugin parent : input

    ready = false
    plugin.once 'items.set', -> ready = true
    waitsFor -> ready

  it 'is registered', -> expect(Plugin.getRegistered 'autocomplete').toBe AutocompletePlugin
  it 'has default options', -> expect(AutocompletePlugin.defaults).toBeTruthy()

  describe 'instance', ->
    it 'is UIPlugin', -> expect(plugin instanceof UIPlugin).toBe true
    it 'is AutocompletePlugin', -> expect(plugin instanceof AutocompletePlugin).toBe true

    describe 'with parent', ->
      it 'adds itself to parent', -> expect(plugin.element.parent()).toBe input.element
      it 'only works with InputPlugin', ->
        parent = new UIPlugin element : $ '<div>'
        expect(-> new AutocompletePlugin parent : parent).toThrow message : 'Expects InputPlugin parent'

  describe '.items', ->
    it 'returns instance of `ItemsManager` plugin', -> expect(plugin.items instanceof ItemsManager).toBeTruthy()

  describe '.visible', ->
    it 'returns `true` when dropdown is visible', ->
      plugin.element.show()
      expect(plugin.visible()).toBe true

    it 'returns `false` when dropdown is not visible', ->
      plugin.element.hide()
      expect(plugin.visible()).toBe false

  describe '.show', ->
    it 'shows the dropdown', ->
      waitsForCallback (done) -> plugin.show done
      runs -> expect(plugin.visible()).toBe true

  describe '.hide', ->
    beforeEach -> waitsForCallback (done) -> plugin.hide done

    it 'hides the dropdown', -> expect(plugin.visible()).toBe false
    it 'deselects selected item', -> expect(plugin.selectedIndex()).toBe -1

  describe '.select', ->
    beforeEach ->
      setItems [ 'item1', 'item2', 'foo', 'bar' ]
      runs -> plugin.element.show()

    it 'selects first element by index', ->
      plugin.select 0
      expectSelected 'item1'

    it 'selects specified element by index', ->
      plugin.select 2
      expectSelected 'foo'

  describe '.selectedIndex', ->
    beforeEach -> setItems [ 'item1', 'item2', 'foo', 'bar' ]

    describe 'when dropdown is not visible', ->
      it 'returns -1', -> expect(plugin.selectedIndex()).toBe -1

    describe 'when dropdown is visible', ->
      it 'returns 0 when first item is selected', ->
        plugin.$('.textext-items-item:eq(0)').addClass 'selected'
        expect(plugin.selectedIndex()).toBe 0

      it 'returns 3 when fourth item is selected', ->
        plugin.$('.textext-items-item:eq(3)').addClass 'selected'
        expect(plugin.selectedIndex()).toBe 3

  describe '.onDownKey', ->
    beforeEach ->
      setItems [ 'item1', 'item2', 'foo', 'bar' ]
      runs -> spyOn(plugin, 'select').andCallThrough()

    describe 'when there is text', ->
      beforeEach ->
        input.value 'item'
        plugin.onDownKey()
        waitsFor -> plugin.select.wasCalled

      it 'selects the first item', -> expectSelected 'item1'

      describe 'dropdown', ->
        it 'is visible', -> expect(plugin.visible()).toBe true
        it 'has items matching text', -> expectItems 'item1 item2'

    describe 'when there is no text', ->
      beforeEach ->
        runs -> plugin.onDownKey()
        waitsFor -> plugin.select.wasCalled

      it 'selects the first item in the dropdown', -> expectSelected 'item1'

      describe 'dropdown', ->
        it 'is visible', -> expect(plugin.visible()).toBe true
        it 'has all original items', -> expectItems 'item1 item2 foo bar'
