{ ItemsPlugin, ItemsManager, Plugin } = $.fn.textext

describe 'ItemsPlugin', ->
  addItem      = (item) -> waitsForCallback (done) -> plugin.addItem item, done
  removeItemAt = (index, item) -> waitsForCallback (done) -> plugin.removeItemAt index, done
  expectItem   = (item) -> expect(plugin.$(".textext-items-item:contains(#{item})").length > 0)

  expectItems = (items) ->
    actual = []
    plugin.$('.textext-items-item .textext-items-label').each -> actual.push $(@).text().replace(/^\s+|\s+$/g, '')
    expect(actual.join ' ').to.equal items

  plugin = null

  beforeEach ->
    plugin = new ItemsPlugin element : $ '<div>'

  it 'has default options', -> expect(ItemsPlugin.defaults).to.be.ok

  describe 'instance', ->
    it 'is Plugin', -> expect(plugin).to.be.instanceof Plugin
    it 'is ItemsPlugin', -> expect(plugin).to.be.instanceof ItemsPlugin

  describe '.items', ->
    it 'returns instance of `ItemsManager` plugin', -> expect(plugin.items).to.be.instanceof ItemsManager

  describe '.itemPosition', ->
    it 'returns item position for element', (done) ->
      plugin.setItems [ 'item1', 'item2', 'item3', 'item4' ], ->
        item = plugin.$ '.textext-items-item:eq(2)'
        expect(plugin.itemPosition item).to.equal 2
        done()

  describe '.displayItems', ->
    describe 'first time', ->
      beforeEach (done) ->
        plugin.displayItems [ 'item1', 'item2', 'item3', 'item4' ], done

      it 'does not change items', -> expect(plugin.items.items).to.deep.equal []
      it 'creates item elements in order', -> expectItems 'item1 item2 item3 item4'

      it 'adds labels to items', ->
        expectItem('item1').to.be.ok
        expectItem('item2').to.be.ok

      describe 'second time', ->
        it 'removes existing item elements', (done) ->
          plugin.displayItems [ 'new1', 'new2' ], ->
            expectItems 'new1 new2'
            done()

  describe '.setItems', ->
    beforeEach (done) ->
      plugin.setItems [ 'item1', 'item2', 'item3', 'item4' ], done

    it 'changes items', -> expect(plugin.items.items).to.deep.equal [ 'item1', 'item2', 'item3', 'item4' ]
    it 'creates item elements in order', -> expectItems 'item1 item2 item3 item4'

  describe '.addItem', ->
    describe 'with no existing items', ->
      it 'adds new item', (done) ->
        plugin.addItem 'item1', ->
          expectItem('item1').to.be.ok
          done()

    describe 'with one existing item', ->
      beforeEach (done) ->
        plugin.setItems [ 'item1' ], ->
          plugin.addItem 'item2', -> done()

      it 'adds new item', -> expectItem('item2').to.be.ok
      it 'has items in order', -> expectItems 'item1 item2'

    it 'emits `items:add`', (done) ->
      plugin.on 'items:add', -> done()
      plugin.addItem 'item'

  describe '.removeItemAt', ->
    describe 'with one existing item', ->
      it 'removes the only item', (done) ->
        plugin.setItems [ 'item1' ], ->
          plugin.removeItemAt 0, ->
            expectItem('item1').to.not.be.ok
            done()

    describe 'with two existing items', ->
      it 'removes one item', (done) ->
        plugin.setItems [ 'item1', 'item3' ], ->
          plugin.removeItemAt 1, ->
            expectItem('item3').to.not.be.ok
            done()

    it 'emits `items:remove`', (done) ->
      plugin.setItems [ 'item1', 'item3' ], ->
        plugin.on 'items:remove', -> done()
        plugin.removeItemAt 0, -> null

