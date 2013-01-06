{ ItemsUIPlugin, ItemsManager, UIPlugin, Plugin } = $.fn.textext

describe 'ItemsUIPlugin', ->
  onItemAdded   = (item) -> waitsForEvent plugin, 'items.added', -> plugin.onItemAdded item
  onItemRemoved = (index, item) -> waitsForEvent plugin, 'items.removed', -> plugin.onItemRemoved index, item
  onItemsSet    = (items) -> waitsForEvent plugin, 'items.set', -> plugin.onItemsSet items
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
    it 'returns item position for element', ->
      runs -> onItemsSet [ 'item1', 'item2', 'item3', 'item4' ]
      runs ->
        item = plugin.$ '.textext-items-item:eq(2)'
        expect(plugin.itemPosition item).toBe 2

  describe '.onItemsSet', ->
    describe 'first time', ->
      beforeEach -> onItemsSet [ 'item1', 'item2', 'item3', 'item4' ]

      it 'creates item elements in order', -> expectItems 'item1 item2 item3 item4'

      it 'adds labels to items', ->
        expectItem('item1').toBeTruthy()
        expectItem('item2').toBeTruthy()

      describe 'second time', ->
        it 'removes existing item elements', ->
          runs -> onItemsSet [ 'new1', 'new2' ]
          runs -> expectItems 'new1 new2'

  describe '.onItemAdded', ->
    describe 'with no existing items', ->
      it 'adds new item', ->
        runs -> onItemAdded 'item1'
        runs -> expectItem('item1').toBeTruthy()

    describe 'with one existing item', ->
      beforeEach ->
        runs -> onItemsSet [ 'item1' ]
        runs -> onItemAdded 'item2'

      it 'adds new item', -> expectItem('item2').toBeTruthy()
      it 'has items in order', -> expectItems 'item1 item2'

    describe 'emitted event', ->
      it 'emits `items.added`', -> waitsForEvent plugin, 'items.added', -> plugin.onItemAdded 'item'

  describe '.onItemRemoved', ->
    describe 'with one existing item', ->
      it 'removes the only item', ->
        runs -> onItemsSet [ 'item1' ]
        runs -> onItemRemoved 0
        runs -> expectItem('item1').toBeFalsy()

    describe 'with two existing items', ->
      it 'removes one item', ->
        runs -> onItemsSet [ 'item1', 'item3' ]
        runs -> onItemRemoved 1
        runs -> expectItem('item3').toBeFalsy()

    describe 'emitted event', ->
      it 'emits `items.removed`', ->
        runs -> onItemsSet [ 'item1', 'item3' ]
        waitsForEvent plugin, 'items.removed', -> plugin.onItemRemoved 0, 'item'

