{ TagsPlugin, Plugin } = $.fn.textext

describe 'TagsPlugin', ->
  wait = (fn) ->
    done = false
    runs -> fn -> done = true
    waitsFor (-> done), 250

  addItemFromInput = -> wait (done) -> plugin.addItemFromInput done
  addItem          = (item) -> wait (done) -> plugin.addItem item, done
  setItems         = (items) -> wait (done) -> plugin.setItems items, done
  moveInput        = (index) -> runs -> plugin.moveInput index

  expectItems         = (items) -> expect(plugin.$('.textext-tags-tag').text().replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '')).toBe items
  expectItem          = (item) -> expect(plugin.$(".textext-tags-tag:contains(#{item})").length > 0)
  expectInputToBeLast = -> expect(plugin.$('> div:last')).toBe '.textext-input'
  expectInputToBeAt   = (index) -> expect(plugin.$ "> div:eq(#{index})").toBe '.textext-input'

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

        it 'removes existing tag elements', ->
          expectItem('new1').toBeTruthy()
          expectItem('new2').toBeTruthy()
          expectItem('item1').toBeFalsy()
          expectItem('item2').toBeFalsy()

        it 'moves input to the end of the list', -> expectInputToBeLast()

  describe '.addItem', ->
    describe 'first item', ->
      beforeEach -> addItem 'item1'

      it 'adds an item', -> expectItem('item1').toBeTruthy()

      describe 'second item', ->
        beforeEach -> addItem 'item2'

        it 'preserves existing items', -> expectItem('item1').toBeTruthy()
        it 'adds another item', -> expectItem('item2').toBeTruthy()

  describe '.addItemFromInput', ->
    describe 'no existing items', ->
      beforeEach ->
        input.value 'item1'
        addItemFromInput()

      it 'adds item to the end of the list', -> expectItem('item1').toBeTruthy()
      it 'clears the input', -> expect(input.value()).toBeFalsy()
      it 'moves input to the end of the list', -> expectInputToBeLast()

    describe 'one existing item', ->
      beforeEach ->
        input.value 'item2'
        setItems [ 'item1' ]
        addItemFromInput()

      it 'adds item to the end of the list', -> expectItem('item2').toBeTruthy()
      it 'clears the input', -> expect(input.value()).toBeFalsy()
      it 'moves input to the end of the list', -> expectInputToBeLast()

    describe 'two existing items', ->
      beforeEach ->
        input.value 'item2'
        setItems [ 'item1', 'item3' ]
        moveInput 1
        addItemFromInput()

      it 'adds item between first and second', -> expectItem('item2').toBeTruthy()
      it 'clears the input', -> expect(input.value()).toBeFalsy()
      it 'moves input after inserted item', -> expectInputToBeAt 2
      it 'has all items in order', -> expectItems 'item1 item2 item3'

  describe '.moveInput', ->
    items = 'item1 item2 item3 item4'.split /\s/g

    beforeEach ->
      setItems items

    it 'moves input to the beginning of the item list', ->
      moveInput 0
      runs -> expectInputToBeAt 0

    it 'moves input to the end of the item list', ->
      moveInput items.length
      runs -> expectInputToBeAt items.length

    it 'moves input to the end of the item list', ->
      moveInput 2
      runs -> expectInputToBeAt 2



