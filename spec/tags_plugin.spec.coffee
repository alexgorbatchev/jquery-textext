{ TagsPlugin, ItemsUIPlugin, UIPlugin, Plugin } = $.fn.textext

describe 'TagsPlugin', ->
  addItem     = (item) -> waitsForEvent plugin, 'items.added', -> plugin.addItem item
  setItems    = (items) -> waitsForEvent plugin, 'items.set', -> plugin.setItems items
  moveInputTo = (index) -> waitsForCallback (done) -> plugin.moveInputTo index, done

  onRightKey = -> waitsForEvent plugin, 'tags.input.moved', -> plugin.onRightKey()
  onLeftKey  = -> waitsForEvent plugin, 'tags.input.moved', -> plugin.onLeftKey()

  expectInputToBeLast = -> expect(plugin.$('> div:last')).to.be '.textext-input'
  expectInputToBeAt   = (index) -> expect(plugin.$ "> div:eq(#{index})").to.be '.textext-input'

  expectItems = (items) ->
    actual = []
    plugin.$('.textext-items-item .textext-items-label').each -> actual.push $(@).text().replace(/^\s+|\s+$/g, '')
    expect(actual.join ' ').to.equal items

  plugin = parent = input = null

  beforeEach (done) ->
    parent = new UIPlugin element : $ '<div class="parent">'
    plugin = new TagsPlugin parent : parent
    input  = plugin.getPlugin 'input'

    plugin.once 'items.set', -> done()

  it 'is registered', -> expect(Plugin.getRegistered 'tags').to.equal TagsPlugin
  it 'has default options', -> expect(TagsPlugin.defaults).to.be.ok

  describe 'instance', ->
    it 'is ItemsUIPlugin', -> expect(plugin).to.be.instanceof ItemsUIPlugin
    it 'is TagsPlugin', -> expect(plugin).to.be.instanceof TagsPlugin
    it 'adds itself to parent plugin', -> expect(plugin.element.parent()).to.be parent.element

  describe '.updateInputPosition', ->
    it 'moves input to be after all items', ->
      plugin.element.append $ '<div class="textext-items-item"/><div class="textext-items-item"/><div class="textext-items-item"/>'
      plugin.updateInputPosition()
      expectInputToBeAt 3

  describe '.moveInputTo', ->
    beforeEach (done) -> plugin.setItems [ 'item1', 'item2', 'item3', 'item4' ], done

    it 'moves input to the beginning of the item list', (done) ->
      plugin.moveInputTo 0, ->
        expectInputToBeAt 0
        done()

    it 'moves input to the end of the item list', (done) ->
      plugin.moveInputTo 4, ->
        expectInputToBeAt 4
        done()

    it 'moves input to the middle of the item list', (done) ->
      plugin.moveInputTo 2, ->
        expectInputToBeAt 2
        done()

  describe '.setItems', ->
    describe 'first time', ->
      it 'moves input to the end of the list', (done) ->
        plugin.setItems [ 'item1', 'item2', 'item3', 'item4' ], ->
          expectInputToBeLast()
          done()

  describe '.addItem', ->
    it 'moves input to the end of the list with no existing items', (done) ->
      plugin.addItem 'item1', ->
        expectInputToBeLast()
        done()

    it 'moves input to the end of the list with one existing item', (done)->
      plugin.setItems [ 'item1' ], ->
        plugin.addItem 'item2', ->
          expectInputToBeLast()
          done()

    describe 'with two existing items', ->
      beforeEach (done) ->
        plugin.setItems [ 'item1', 'item3' ], -> plugin.moveInputTo 1, -> plugin.addItem 'item2', done

      it 'keeps input after inserted item', -> expectInputToBeAt 2
      it 'has items in order', -> expectItems 'item1 item2 item3'

  describe '.onRightKey', ->
    beforeEach (done) ->
      plugin.setItems [ 'item1', 'item2', 'item3' ], -> plugin.moveInputTo 1, done

    describe 'when there is no text in the input field', ->
      beforeEach ->
        spy plugin, 'moveInputTo'
        plugin.onRightKey()

      it 'moves the input field', (done) -> expect(-> plugin.moveInputTo).to.happen.and.notify done

    describe 'when there is text in the input field', ->
      beforeEach ->
        spy plugin, 'moveInputTo'
        input.value 'text'
        plugin.onRightKey()

      it 'does not move the input field', (done) -> expect(-> plugin.moveInputTo).to.not.happen.and.notify done

  describe '.onLeftKey', ->
    beforeEach (done) ->
      plugin.setItems [ 'item1', 'item2', 'item3' ], done

    describe 'when there is no text in the input field', ->
      beforeEach ->
        spy plugin, 'moveInputTo'
        plugin.onLeftKey()

      it 'moves the input field', (done) -> expect(-> plugin.moveInputTo).to.happen.and.notify done

    describe 'when there is text in the input field', ->
      beforeEach ->
        spy plugin, 'moveInputTo'
        input.value 'text'
        plugin.onLeftKey()

      it 'does not move the input field', (done) -> expect(-> plugin.moveInputTo).to.not.happen.and.notify done

  describe '.onHotKey', ->
    beforeEach -> spy(plugin.items, 'fromString')

    describe 'when there is text', ->
      beforeEach ->
        spy plugin.items, 'add'
        input.value 'item'
        plugin.onHotKey()

      it 'adds new item', (done) -> expect(-> plugin.items.add.called).to.happen.and.notify done
      it 'clears the input', -> expect(plugin.input.empty()).to.be.false

    describe 'when there is no text', ->
      beforeEach -> plugin.onHotKey()
      it 'does not add new item', (done) -> expect(-> plugin.items.fromString).to.happen.and.notify done

  describe '.onRemoveTagClick', ->
    beforeEach ->
      spy plugin.items, 'removeAt'

      plugin.setItems [ 'item1', 'item2', 'item3', 'item4' ], ->
        e = jQuery.Event 'click'
        e.target = plugin.$('.textext-tags-tag:eq(2) a').get(0)
        plugin.onRemoveTagClick e

    it 'removes item', (done) -> expect(-> plugin.items.removeAt).to.happen.and.notify done
