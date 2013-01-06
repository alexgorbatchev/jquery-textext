{ ItemsUIPlugin, ItemsManager, UIPlugin, Plugin } = $.fn.textext

describe 'ItemsUIPlugin', ->
  onItemAdded   = (item) -> waitForEvent plugin, 'items.added', -> plugin.onItemAdded item
  onItemRemoved = (index, item) -> waitForEvent plugin, 'items.removed', -> plugin.onItemRemoved index, item
  onItemsSet    = (items) -> waitForEvent plugin, 'items.set', -> plugin.onItemsSet items
  expectItem    = (item) -> expect(plugin.$(".textext-items-item:contains(#{item})").length > 0)

  expectItems = (items) ->
    actual = []
    plugin.$('.textext-items-item .textext-items-label').each -> actual.push $(@).text().replace(/^\s+|\s+$/g, '')
    expect(actual.join ' ').toBe items

  plugin = null

  beforeEach ->
    plugin = new ItemsUIPlugin element : $ '<div>'

  it 'has default options', -> expect(ItemsUIPlugin.defaults).toBeTruthy()

  describe 'instance', ->
    it 'is UIPlugin', -> expect(plugin instanceof UIPlugin).toBe true
    it 'is ItemsUIPlugin', -> expect(plugin instanceof ItemsUIPlugin).toBe true

  describe '.items', ->
    it 'returns instance of `ItemsManager` plugin', -> expect(plugin.items instanceof ItemsManager).toBeTruthy()

  describe '.itemPosition', ->
    beforeEach -> onItemsSet [ 'item1', 'item2', 'item3', 'item4' ]

    it 'returns item position for element', ->
      item = plugin.$ '.textext-items-item:eq(2)'
      expect(plugin.itemPosition item).toBe 2

  describe '.onItemsSet', ->
    describe 'first time', ->
      beforeEach ->
        onItemsSet [ 'item1', 'item2', 'item3', 'item4' ]

      it 'creates item elements in order', -> expectItems 'item1 item2 item3 item4'

      it 'adds labels to items', ->
        expectItem('item1').toBeTruthy()
        expectItem('item2').toBeTruthy()

      describe 'second time', ->
        beforeEach -> onItemsSet [ 'new1', 'new2' ]

        it 'removes existing item elements', -> expectItems 'new1 new2'

  describe '.onItemAdded', ->
    describe 'with no existing items', ->
      beforeEach -> onItemAdded 'item1'

      it 'adds new item', -> expectItem('item1').toBeTruthy()

    describe 'with one existing item', ->
      beforeEach ->
        onItemsSet [ 'item1' ]
        onItemAdded 'item2'

      it 'adds new item', -> expectItem('item2').toBeTruthy()
      it 'has items in order', -> expectItems 'item1 item2'

    describe 'emitted event', ->
      it 'emits `items.added`', -> waitForEvent plugin, 'items.added', -> plugin.onItemAdded 'item'

  describe '.onItemRemoved', ->
    describe 'with one existing item', ->
      beforeEach ->
        onItemsSet [ 'item1' ]
        onItemRemoved 0

      it 'removes the only item', -> expectItem('item1').toBeFalsy()

    describe 'with two existing items', ->
      beforeEach ->
        onItemsSet [ 'item1', 'item3' ]
        onItemRemoved 1

      it 'removes one item', -> expectItem('item3').toBeFalsy()

    describe 'emitted event', ->
      beforeEach -> onItemsSet [ 'item1', 'item3' ]
      it 'emits `items.removed`', -> waitForEvent plugin, 'items.removed', -> plugin.onItemRemoved 0, 'item'

