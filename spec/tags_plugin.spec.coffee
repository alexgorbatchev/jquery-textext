{ TagsPlugin, Plugin } = $.fn.textext

describe 'TagsPlugin', ->
  setItems = (items) ->
    done = false
    runs -> plugin.setItems items, -> done = true
    waitsFor (-> done), 250

  addItem = (item) ->
    done = false
    runs -> plugin.addItem item, -> done = true
    waitsFor (-> done), 250

  insertItem = (item, position) ->
    done = false
    runs -> plugin.insertItem item, position, -> done = true
    waitsFor (-> done), 250

  expectItem = (item) -> expect(plugin.$(".textext-tags-tag:contains(#{item})").length > 0)

  plugin = parent = null

  beforeEach ->
    parent = new Plugin element : $ '<div class="parent">'
    plugin = new TagsPlugin parent : parent

  it 'is registered', -> expect(Plugin.getRegistered 'tags').toBe TagsPlugin
  it 'has default options', -> expect(TagsPlugin.defaults).toBeTruthy()

  describe 'instance', ->
    it 'is Plugin', -> expect(plugin instanceof Plugin).toBe true
    it 'is TagsPlugin', -> expect(plugin instanceof TagsPlugin).toBe true
    it 'adds itself to parent plugin', -> expect(parent.element).toContain plugin.element

  describe '.setItems', ->
    describe 'calling first time', ->
      beforeEach -> setItems [ 'item1', 'item2' ]

      it 'creates tag elements', ->
        expect(plugin.$('.textext-tags-tag').length).toBe 2

      it 'adds labels to tags', ->
        expectItem('item1').toBeTruthy()
        expectItem('item2').toBeTruthy()

      it 'moves input to the end of the list', -> expect(plugin.$('> div:last')).toBe '.textext-input'

      describe 'calling second time', ->
        beforeEach -> setItems [ 'new1', 'new2' ]

        it 'removes existing tag elements', ->
          expectItem('new1').toBeTruthy()
          expectItem('new2').toBeTruthy()
          expectItem('item1').toBeFalsy()
          expectItem('item2').toBeFalsy()

        it 'moves input to the end of the list', -> expect(plugin.$('> div:last')).toBe '.textext-input'

  describe '.addItem', ->
    describe 'first item', ->
      beforeEach -> addItem 'item1'

      it 'adds an item', -> expectItem('item1').toBeTruthy()

      describe 'second item', ->
        beforeEach -> addItem 'item2'

        it 'preserves existing items', -> expectItem('item1').toBeTruthy()
        it 'adds another item', -> expectItem('item2').toBeTruthy()

  describe '.insertItem', ->
    beforeEach ->
      setItems [ 'item1', 'item2' ]
      insertItem 'item3', 1

    it 'adds an item', -> expectItem('item3').toBeTruthy()

    it 'adds item in the correct position', ->
      tags = plugin.$('> .textext-tags-tag')
      expect($(tags[0]).text()).toContain 'item1'
      expect($(tags[1]).text()).toContain 'item3'
      expect($(tags[2]).text()).toContain 'item2'

  describe '.moveInputTo', ->
    items = 'item1 item2 item3 item4'.split /\s/g

    moveInputTo = (index) ->
      plugin.moveInputTo index
      divs = plugin.$ '> div'
      expect(divs.length).toBe items.length + 1
      expect(divs[index]).toBe '.textext-input'

    beforeEach ->
      done = false
      runs -> plugin.setItems items, -> done = true
      waitsFor (-> done), 250

    it 'moves input to the beginning of the item list', -> moveInputTo 0
    it 'moves input to the end of the item list', -> moveInputTo items.length
