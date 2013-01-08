{ ItemsUIPlugin, ItemsManager, UIPlugin, Plugin } = $.fn.textext

describe 'ItemsUIPlugin', ->
  setItems     = (items) -> waitsForCallback (done) -> plugin.setItems items, done
  addItem      = (item) -> waitsForCallback (done) -> plugin.addItem item, done
  removeItemAt = (index, item) -> waitsForCallback (done) -> plugin.removeItemAt index, done
  expectItem   = (item) -> expect(plugin.$(".textext-items-item:contains(#{item})").length > 0)

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
      runs -> setItems [ 'item1', 'item2', 'item3', 'item4' ]
      runs ->
        item = plugin.$ '.textext-items-item:eq(2)'
        expect(plugin.itemPosition item).toBe 2

  describe '.setItems', ->
    describe 'first time', ->
      beforeEach -> setItems [ 'item1', 'item2', 'item3', 'item4' ]

      it 'creates item elements in order', -> expectItems 'item1 item2 item3 item4'

      it 'adds labels to items', ->
        expectItem('item1').toBeTruthy()
        expectItem('item2').toBeTruthy()

      describe 'second time', ->
        it 'removes existing item elements', ->
          runs -> setItems [ 'new1', 'new2' ]
          runs -> expectItems 'new1 new2'

  describe '.addItem', ->
    describe 'with no existing items', ->
      it 'adds new item', ->
        runs -> addItem 'item1'
        runs -> expectItem('item1').toBeTruthy()

    describe 'with one existing item', ->
      beforeEach ->
        runs -> setItems [ 'item1' ]
        runs -> addItem 'item2'

      it 'adds new item', -> expectItem('item2').toBeTruthy()
      it 'has items in order', -> expectItems 'item1 item2'

    describe 'emitted event', ->
      it 'emits `items.added`', -> waitsForEvent plugin, 'items.added', -> plugin.addItem 'item'

  describe '.removeItemAt', ->
    describe 'with one existing item', ->
      it 'removes the only item', ->
        runs -> setItems [ 'item1' ]
        runs -> removeItemAt 0
        runs -> expectItem('item1').toBeFalsy()

    describe 'with two existing items', ->
      it 'removes one item', ->
        runs -> setItems [ 'item1', 'item3' ]
        runs -> removeItemAt 1
        runs -> expectItem('item3').toBeFalsy()

    describe 'emitted event', ->
      it 'emits `items.removed`', ->
        runs -> setItems [ 'item1', 'item3' ]
        waitsForEvent plugin, 'items.removed', -> plugin.removeItemAt 0

