{ TagsPlugin, ItemsUIPlugin, UIPlugin, Plugin } = $.fn.textext

describe 'TagsPlugin', ->
  onItemAdded   = (item) -> waitsForEvent plugin, 'items.added', -> plugin.onItemAdded item
  onItemRemoved = (index, item) -> waitsForEvent plugin, 'items.removed', -> plugin.onItemRemoved index, item
  onItemsSet    = (items) -> waitsForEvent plugin, 'items.set', -> plugin.onItemsSet items
  onRightKey    = -> waitsForEvent plugin, 'tags.input.moved', -> plugin.onRightKey()
  onLeftKey     = -> waitsForEvent plugin, 'tags.input.moved', -> plugin.onLeftKey()
  moveInputTo   = (index) -> waitsForCallback (done) -> plugin.moveInputTo index, done

  expectInputToBeLast = -> expect(plugin.$('> div:last')).toBe '.textext-input'
  expectInputToBeAt   = (index) -> expect(plugin.$ "> div:eq(#{index})").toBe '.textext-input'

  expectItems = (items) ->
    actual = []
    plugin.$('.textext-items-item .textext-items-label').each -> actual.push $(@).text().replace(/^\s+|\s+$/g, '')
    expect(actual.join ' ').toBe items

  plugin = parent = input = null

  beforeEach ->
    parent = new UIPlugin element : $ '<div class="parent">'
    plugin = new TagsPlugin parent : parent
    input  = plugin.getPlugin 'input'

    ready = false
    plugin.once 'items.set', -> ready = true
    waitsFor -> ready

  it 'is registered', -> expect(Plugin.getRegistered 'tags').toBe TagsPlugin
  it 'has default options', -> expect(TagsPlugin.defaults).toBeTruthy()

  describe 'instance', ->
    it 'is ItemsUIPlugin', -> expect(plugin instanceof ItemsUIPlugin).toBe true
    it 'is TagsPlugin', -> expect(plugin instanceof TagsPlugin).toBe true
    it 'adds itself to parent plugin', -> expect(parent.element).toContain plugin.element

  describe '.updateInputPosition', ->
    it 'moves input to be after all items', ->
      plugin.element.append $ '<div class="textext-items-item"/><div class="textext-items-item"/><div class="textext-items-item"/>'
      plugin.updateInputPosition()
      expectInputToBeAt 3

  describe '.moveInputTo', ->
    beforeEach -> onItemsSet [ 'item1', 'item2', 'item3', 'item4' ]

    it 'moves input to the beginning of the item list', ->
      runs -> moveInputTo 0
      runs -> expectInputToBeAt 0

    it 'moves input to the end of the item list', ->
      runs -> moveInputTo 4
      runs -> expectInputToBeAt 4

    it 'moves input to the middle of the item list', ->
      runs -> moveInputTo 2
      runs -> expectInputToBeAt 2

  describe '.onItemsSet', ->
    describe 'first time', ->
      it 'moves input to the end of the list', ->
        runs -> onItemsSet [ 'item1', 'item2', 'item3', 'item4' ]
        runs -> expectInputToBeLast()

  describe '.onItemAdded', ->
    describe 'with no existing items', ->
      it 'moves input to the end of the list', ->
        runs -> onItemAdded 'item1'
        runs -> expectInputToBeLast()

    describe 'with one existing item', ->
      it 'moves input to the end of the list', ->
        runs -> onItemsSet [ 'item1' ]
        runs -> onItemAdded 'item2'
        runs -> expectInputToBeLast()

    describe 'with two existing items', ->
      beforeEach ->
        runs -> onItemsSet [ 'item1', 'item3' ]
        runs -> moveInputTo 1
        runs -> onItemAdded 'item2'

      it 'keeps input after inserted item', -> expectInputToBeAt 2
      it 'has items in order', -> expectItems 'item1 item2 item3'

  describe '.onRightKey', ->
    beforeEach ->
      runs -> onItemsSet [ 'item1', 'item2', 'item3' ]
      runs -> moveInputTo 1

    describe 'when there is no text in the input field', ->
      beforeEach ->
        spyOn plugin, 'moveInputTo'
        plugin.onRightKey()

      it 'moves the input field', -> expect(plugin.moveInputTo).toHaveBeenCalled()

    describe 'when there is text in the input field', ->
      beforeEach ->
        spyOn plugin, 'moveInputTo'
        input.value 'text'
        plugin.onRightKey()

      it 'does not move the input field', -> expect(plugin.moveInputTo).not.toHaveBeenCalled()

  describe '.onLeftKey', ->
    beforeEach -> onItemsSet [ 'item1', 'item2', 'item3' ]

    describe 'when there is no text in the input field', ->
      beforeEach ->
        spyOn plugin, 'moveInputTo'
        plugin.onLeftKey()

      it 'moves the input field', -> expect(plugin.moveInputTo).toHaveBeenCalled()

    describe 'when there is text in the input field', ->
      beforeEach ->
        spyOn plugin, 'moveInputTo'
        input.value 'text'
        plugin.onLeftKey()

      it 'does not move the input field', -> expect(plugin.moveInputTo).not.toHaveBeenCalled()

  describe '.onHotKey', ->
    beforeEach -> spyOn(plugin.items, 'fromString').andCallThrough()

    describe 'when there is text', ->
      beforeEach ->
        spyOn(plugin.items, 'add').andCallThrough()
        input.value 'item'
        plugin.onHotKey()

      it 'adds new item', -> waitsFor -> plugin.items.add.wasCalled
      it 'clears the input', -> waitsFor -> plugin.input.empty()

    describe 'when there is no text', ->
      beforeEach -> plugin.onHotKey()
      it 'does not add new item', -> expect(plugin.items.fromString).not.toHaveBeenCalled()

  describe '.onRemoveTagClick', ->
    beforeEach ->
      onItemsSet [ 'item1', 'item2', 'item3', 'item4' ]

      runs ->
        spyOn plugin.items, 'removeAt'

        e = jQuery.Event 'click'
        e.target = plugin.$('.textext-tags-tag:eq(2) a').get(0)
        plugin.onRemoveTagClick e

    it 'removes item', -> expect(plugin.items.removeAt).toHaveBeenCalled()
