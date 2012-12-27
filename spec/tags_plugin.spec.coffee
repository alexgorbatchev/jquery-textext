{ TagsPlugin, Plugin } = $.fn.textext

describe 'TagsPlugin', ->
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
    items = [ 'item1', 'item2' ]

    beforeEach ->
      done = false
      runs -> plugin.setItems items, -> done = true
      waitsFor (-> done), 250

    it 'creates tag elements', ->
      expect(plugin.$('.textext-tags-tag').length).toBe items.length

    it 'adds labels to tags', ->
      text = plugin.$('.textext-tags-tag').text()
      expect(text).toContain items[0]
      expect(text).toContain items[1]

    it 'removes existing tag elements', ->
      done = false
      runs -> plugin.setItems [ 'new1', 'new2' ], -> done = true
      waitsFor (-> done), 250
      runs ->
        text = plugin.$('.textext-tags-tag').text()
        expect(text).toContain 'new1'
        expect(text).toContain 'new2'
        expect(text).not.toContain items[0]
        expect(text).not.toContain items[1]

    it 'moves input to the end of the list', -> expect(plugin.$('> div:last')).toBe '.textext-input'

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
