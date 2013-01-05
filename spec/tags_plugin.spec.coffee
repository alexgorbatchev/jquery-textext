{ TagsPlugin, Items, UIPlugin, Plugin } = $.fn.textext

describe 'TagsPlugin', ->
  onItemAdded   = (item) -> waitForEvent plugin, 'tags.added', -> plugin.onItemAdded item
  onItemRemoved = (index, item) -> waitForEvent plugin, 'tags.removed', -> plugin.onItemRemoved index, item
  onItemsSet    = (items) -> waitForEvent plugin, 'tags.set', -> plugin.onItemsSet items
  onRightKey    = -> waitForEvent plugin, 'tags.input.moved', -> plugin.onRightKey()
  onLeftKey    = -> waitForEvent plugin, 'tags.input.moved', -> plugin.onLeftKey()
  moveInputTo   = (index) -> wait (done) -> plugin.moveInputTo index, done

  expectInputToBeLast = -> expect(plugin.$('> div:last')).toBe '.textext-input'
  expectInputToBeAt   = (index) -> expect(plugin.$ "> div:eq(#{index})").toBe '.textext-input'
  expectItem          = (item) -> expect(plugin.$(".textext-tags-tag:contains(#{item})").length > 0)

  expectItems = (items) ->
    actual = []
    plugin.$('.textext-tags-tag .textext-tags-label').each -> actual.push $(@).text().replace(/^\s+|\s+$/g, '')
    expect(actual.join ' ').toBe items

  plugin = parent = input = null

  beforeEach ->
    parent = new UIPlugin element : $ '<div class="parent">'
    plugin = new TagsPlugin parent : parent
    input = plugin.getPlugin 'input'

  it 'is registered', -> expect(Plugin.getRegistered 'tags').toBe TagsPlugin
  it 'has default options', -> expect(TagsPlugin.defaults).toBeTruthy()

  describe 'instance', ->
    it 'is UIPlugin', -> expect(plugin instanceof UIPlugin).toBe true
    it 'is TagsPlugin', -> expect(plugin instanceof TagsPlugin).toBe true
    it 'adds itself to parent plugin', -> expect(parent.element).toContain plugin.element

  describe '.items', ->
    it 'returns instance of `Items` plugin', -> expect(plugin.items instanceof Items).toBeTruthy()

  describe '.itemPosition', ->
    beforeEach -> onItemsSet [ 'item1', 'item2', 'item3', 'item4' ]

    it 'returns item position for element', ->
      item = plugin.$ '.textext-tags-tag:eq(2)'
      expect(plugin.itemPosition item).toBe 2

  describe '.onItemsSet', ->
    describe 'first time', ->
      beforeEach -> onItemsSet [ 'item1', 'item2', 'item3', 'item4' ]

      it 'creates tag elements in order', -> console.log 'check'; expectItems 'item1 item2 item3 item4'

      it 'adds labels to tags', ->
        expectItem('item1').toBeTruthy()
        expectItem('item2').toBeTruthy()

      it 'moves input to the end of the list', -> expectInputToBeLast()

      describe 'second time', ->
        beforeEach -> onItemsSet [ 'new1', 'new2' ]

        it 'removes existing tag elements', -> expectItems 'new1 new2'
        it 'moves input to the end of the list', -> expectInputToBeLast()

  describe '.onItemAdded', ->
    describe 'with no existing items', ->
      beforeEach -> onItemAdded 'item1'

      it 'adds new item', -> expectItem('item1').toBeTruthy()
      it 'moves input to the end of the list', -> expectInputToBeLast()

    describe 'with one existing item', ->
      beforeEach ->
        onItemsSet [ 'item1' ]
        onItemAdded 'item2'

      it 'adds new item', -> expectItem('item2').toBeTruthy()
      it 'moves input to the end of the list', -> expectInputToBeLast()
      it 'has items in order', -> expectItems 'item1 item2'

    describe 'with two existing items', ->
      beforeEach ->
        onItemsSet [ 'item1', 'item3' ]
        moveInputTo 1
        onItemAdded 'item2'

      it 'adds item between first and second', -> expectItem('item2').toBeTruthy()
      it 'moves input after inserted item', -> expectInputToBeAt 2
      it 'has items in order', -> expectItems 'item1 item2 item3'

    describe 'emitted event', ->
      it 'emits `tags.added`', -> waitForEvent plugin, 'tags.added', -> plugin.onItemAdded 'item'

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
      it 'emits `tags.removed`', -> waitForEvent plugin, 'tags.removed', -> plugin.onItemRemoved 0, 'item'

  describe '.moveInputTo', ->
    items = 'item1 item2 item3 item4'.split /\s/g

    beforeEach ->
      onItemsSet items

    it 'moves input to the beginning of the item list', ->
      moveInputTo 0
      runs -> expectInputToBeAt 0

    it 'moves input to the end of the item list', ->
      moveInputTo items.length
      runs -> expectInputToBeAt items.length

    it 'moves input to the end of the item list', ->
      moveInputTo 2
      runs -> expectInputToBeAt 2

  describe '.onRightKey', ->
    beforeEach ->
      onItemsSet [ 'item1', 'item2', 'item3' ]
      moveInputTo 1

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
    beforeEach ->
      onItemsSet [ 'item1', 'item2', 'item3' ]

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
