{ TagsPlugin, ItemsPlugin, Plugin, series } = $.fn.textext

describe 'TagsPlugin', ->
  expectInputToBeLast = -> expect(plugin.$('.textext-items-item, .textext-input').last()).to.be '.textext-input'
  expectInputToBeAt   = (index) -> expect(plugin.$('.textext-items-item, .textext-input').get(index)).to.be '.textext-input'

  expectItems = (items) ->
    actual = []
    plugin.$('.textext-items-item .textext-items-label').each -> actual.push $(@).text().replace(/^\s+|\s+$/g, '')
    expect(actual.join ' ').to.equal items

  plugin = parent = input = null

  beforeEach ->
    parent = new Plugin element : $ '<div class="parent">'
    plugin = new TagsPlugin parent : parent
    input  = plugin.getPlugin 'input'

  it 'is registered', -> expect(Plugin.getRegistered 'tags').to.equal TagsPlugin
  it 'has default options', -> expect(TagsPlugin.defaults).to.be.ok

  describe 'instance', ->
    it 'is ItemsPlugin', -> expect(plugin).to.be.instanceof ItemsPlugin
    it 'is TagsPlugin', -> expect(plugin).to.be.instanceof TagsPlugin
    it 'adds itself to parent plugin', -> expect(plugin.element.parent()).to.be parent.element

  describe '.complete', ->
    describe 'when there is text', ->
      beforeEach ->
        spy plugin.items, 'add'
        input.value 'item'

      it 'adds new item', (done) ->
        plugin.complete().done ->
          expect(plugin.items.add).to.be.called done

      it 'clears the input', (done) ->
        plugin.complete().done ->
          expect(plugin.input.empty()).to.be.true
          done()

      it 'does not allow duplicates', (done) ->
        plugin.userOptions.allowDuplicates = false

        plugin.setItems([ 'item' ]).done ->
          plugin.complete().fail ->
            expectItems 'item'
            done()

    describe 'when there is no text', ->
      it 'does not add new item', (done) ->
        plugin.complete().fail ->
          expectItems ''
          done()

  describe '.updateInputPosition', ->
    it 'moves input to be after all items', ->
      plugin.element.append $ '<div class="textext-items-item"/><div class="textext-items-item"/><div class="textext-items-item"/>'
      plugin.updateInputPosition()
      expectInputToBeAt 3

  describe '.moveInputTo', ->
    beforeEach (done) ->
      plugin.setItems([ 'item1', 'item2', 'item3', 'item4' ]).done ->
        done()

    it 'moves input to the beginning of the item list', (done) ->
      plugin.moveInputTo(0).done ->
        expectInputToBeAt 0
        done()

    it 'moves input to the end of the item list', (done) ->
      plugin.moveInputTo(4).done ->
        expectInputToBeAt 4
        done()

    it 'moves input to the middle of the item list', (done) ->
      plugin.moveInputTo(2).done ->
        expectInputToBeAt 2
        done()

  describe '.setItems', ->
    describe 'first time', ->
      it 'moves input to the end of the list', (done) ->
        plugin.setItems([ 'item1', 'item2', 'item3', 'item4' ]).done ->
          expectInputToBeLast()
          done()

  describe '.addItem', ->
    it 'moves input to the end of the list with no existing items', (done) ->
      plugin.addItem('item1').done ->
        expectInputToBeLast()
        done()

    it 'moves input to the end of the list with one existing item', (done)->
      plugin.setItems([ 'item1' ]).done ->
        plugin.addItem('item2').done ->
          expectInputToBeLast()
          done()

    describe 'with two existing items', ->
      beforeEach (done) ->
        series(
          plugin.setItems([ 'item1', 'item3' ])
          plugin.moveInputTo(1)
          plugin.addItem('item2')
        ).done ->
          done()

      it 'keeps input after inserted item', -> expectInputToBeAt 2
      it 'has items in order', -> expectItems 'item1 item2 item3'

  describe '.onRightKey', ->
    beforeEach (done) ->
      series(
        plugin.setItems([ 'item1', 'item2', 'item3' ])
        plugin.moveInputTo(1)
      ).done ->
        done()

    describe 'when there is no text in the input field', ->
      beforeEach ->
        spy plugin, 'moveInputTo'

      it 'moves the input field', (done) ->
        plugin.onRightKey().done ->
          expect(plugin.moveInputTo).to.be.called done

    describe 'when there is text in the input field', ->
      beforeEach ->
        spy plugin, 'moveInputTo'
        input.value 'text'

      it 'does not move the input field', (done) ->
        plugin.onRightKey().fail ->
          expect(plugin.moveInputTo).to.not.be.called done

  describe '.onLeftKey', ->
    beforeEach (done) ->
      plugin.setItems([ 'item1', 'item2', 'item3' ]).done ->
        done()

    describe 'when there is no text in the input field', ->
      beforeEach -> spy plugin, 'moveInputTo'

      it 'moves the input field', (done) ->
        plugin.onLeftKey().done ->
          expect(plugin.moveInputTo).to.be.called done

    describe 'when there is text in the input field', ->
      beforeEach ->
        spy plugin, 'moveInputTo'
        input.value 'text'

      it 'does not move the input field', (done) ->
        plugin.onLeftKey().fail ->
          expect(plugin.moveInputTo).to.not.be.called done

  describe '.onRemoveTagClick', ->
    beforeEach ->
      spy plugin.items, 'removeAt'

      plugin.setItems([ 'item1', 'item2', 'item3', 'item4' ]).done ->
        e = jQuery.Event 'click'
        e.target = plugin.$('.textext-tags-tag:eq(2) a').get(0)
        plugin.$onRemoveTagClick e

    it 'removes item', (done) -> expect(plugin.items.removeAt).to.be.called done
