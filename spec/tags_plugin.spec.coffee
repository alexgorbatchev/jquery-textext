{ TagsPlugin, Plugin } = $.fn.textext

describe 'TagsPlugin', ->
  wait = (fn) ->
    done = false
    runs -> fn -> done = true
    waitsFor (-> done), 250

  addItem           = (item) -> wait (done) -> plugin.addItem item, done
  removeItemByIndex = (item) -> wait (done) -> plugin.removeItemByIndex item, done
  setItems          = (items) -> wait (done) -> plugin.setItems items, done
  moveInputTo       = (index) -> wait (done) -> plugin.moveInputTo index, done

  expectInputToBeLast = -> expect(plugin.$('> div:last')).toBe '.textext-input'
  expectInputToBeAt   = (index) -> expect(plugin.$ "> div:eq(#{index})").toBe '.textext-input'
  expectItem          = (item) -> expect(plugin.$(".textext-tags-tag:contains(#{item})").length > 0)

  expectItems = (items) ->
    actual = []
    plugin.$('.textext-tags-tag .textext-tags-label').each -> actual.push $(@).text().replace(/^\s+|\s+$/g, '')
    expect(actual.join ' ').toBe items

  plugin = parent = input = null

  beforeEach ->
    parent = new Plugin element : $ '<div class="parent">'
    plugin = new TagsPlugin parent : parent
    input = plugin.getPlugin 'input'

  it 'is registered', -> expect(Plugin.getRegistered 'tags').toBe TagsPlugin
  it 'has default options', -> expect(TagsPlugin.defaults).toBeTruthy()

  describe 'instance', ->
    it 'is Plugin', -> expect(plugin instanceof Plugin).toBe true
    it 'is TagsPlugin', -> expect(plugin instanceof TagsPlugin).toBe true
    it 'adds itself to parent plugin', -> expect(parent.element).toContain plugin.element

  describe '.itemPosition', ->
    beforeEach -> setItems [ 'item1', 'item2', 'item3', 'item4' ]

    it 'returns item position for element', ->
      item = plugin.$ '.textext-tags-tag:eq(2)'
      expect(plugin.itemPosition item).toBe 2

  describe '.setItems', ->
    describe 'first time', ->
      beforeEach -> setItems [ 'item1', 'item2', 'item3', 'item4' ]

      it 'creates tag elements in order', -> expectItems 'item1 item2 item3 item4'

      it 'adds labels to tags', ->
        expectItem('item1').toBeTruthy()
        expectItem('item2').toBeTruthy()

      it 'moves input to the end of the list', -> expectInputToBeLast()

      describe 'second time', ->
        beforeEach -> setItems [ 'new1', 'new2' ]

        it 'removes existing tag elements', -> expectItems 'new1 new2'
        it 'moves input to the end of the list', -> expectInputToBeLast()

  describe '.addItem', ->
    describe 'no existing items', ->
      beforeEach ->
        addItem 'item1'

      it 'adds new item', -> expectItem('item1').toBeTruthy()
      it 'moves input to the end of the list', -> expectInputToBeLast()

    describe 'one existing item', ->
      beforeEach ->
        setItems [ 'item1' ]
        addItem 'item2'

      it 'adds new item', -> expectItem('item2').toBeTruthy()
      it 'moves input to the end of the list', -> expectInputToBeLast()
      it 'has items in order', -> expectItems 'item1 item2'

    describe 'two existing items', ->
      beforeEach ->
        setItems [ 'item1', 'item3' ]
        moveInputTo 1
        addItem 'item2'

      it 'adds item between first and second', -> expectItem('item2').toBeTruthy()
      it 'moves input after inserted item', -> expectInputToBeAt 2
      it 'has items in order', -> expectItems 'item1 item2 item3'

  describe '.removeItemByIndex', ->
    describe 'one existing item', ->
      beforeEach ->
        setItems [ 'item1' ]
        removeItemByIndex 0

      it 'removes existing item', -> expectItem('item1').toBeFalsy()

    describe 'two existing items', ->
      beforeEach ->
        setItems [ 'item1', 'item3' ]
        removeItemByIndex 1

      it 'removes existing item', -> expectItem('item3').toBeFalsy()

  describe '.moveInputTo', ->
    items = 'item1 item2 item3 item4'.split /\s/g

    beforeEach ->
      setItems items

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
      setItems [ 'item1', 'item2', 'item3' ]
      moveInputTo 1

    describe 'when there is no text in the input field', ->
      beforeEach -> wait (done) -> plugin.onRightKey null, null, done
      it 'moves the input field', -> expectInputToBeAt 2

    describe 'when there is text in the input field', ->
      beforeEach -> wait (done) ->
        input.value 'text'
        plugin.onRightKey null, null, done

      it 'does not move the input field', -> expectInputToBeAt 1

  describe '.onLeftKey', ->
    beforeEach ->
      setItems [ 'item1', 'item2', 'item3' ]

    describe 'when there is no text in the input field', ->
      beforeEach -> wait (done) -> plugin.onLeftKey null, null, done
      it 'moves the input field', -> expectInputToBeAt 2

    describe 'when there is text in the input field', ->
      beforeEach -> wait (done) ->
        input.value 'text'
        plugin.onLeftKey null, null, done

      it 'does not move the input field', -> expectInputToBeAt 3

  describe '.onHotKey', ->
    describe 'when there is text', ->
      beforeEach -> wait (done) ->
        input.value 'item'
        plugin.onHotKey null, null, done

      it 'adds new item', -> expectItem('item').toBeTruthy()
      it 'clears the input', -> expect(input.value()).toBeFalsy()

    describe 'when there is no text', ->
      beforeEach -> wait (done) -> plugin.onHotKey null, null, done

      it 'does not add new item', ->
        expect(plugin.element.find('.textext-tags-tag').length).toBe 0

  describe '.onRemoveTagClick', ->
    beforeEach ->
      e = jQuery.Event 'click'

      setItems [ 'item1', 'item2', 'item3', 'item4' ]
      runs -> e.target = plugin.$('.textext-tags-tag:eq(2) a').get(0)
      wait (done) -> plugin.onRemoveTagClick e, done

    it 'removes item', -> expectItems 'item1 item2 item4'





