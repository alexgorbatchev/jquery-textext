{ TagsPlugin, Plugin } = $.fn.textext

describe 'TagsPlugin', ->
  plugin = null

  beforeEach ->
    plugin = new TagsPlugin

  it 'is registered', -> expect(Plugin.registery['tags']).toBe TagsPlugin
  it 'has default options', -> expect(TagsPlugin.defaults).toBeTruthy()

  describe 'instance', ->
    it 'is Plugin', -> expect(plugin instanceof Plugin).toBe true
    it 'is TagsPlugins', -> expect(plugin instanceof TagsPlugin).toBe true

  describe '.setItems', ->
    items = [ 'item1', 'item2' ]

    beforeEach ->
      done = false
      runs -> plugin.setItems items, -> done = true
      waitsFor -> done

    it 'creates tag elements', -> expect(plugin.$('.textext-tags-tag').length).toBe items.length

    it 'adds labels to tags', ->
      text = plugin.$('.textext-tags-tag').text()
      expect(text).toContain items[0]
      expect(text).toContain items[1]

  describe '.moveInputTo', ->
    items = 'item1 item2 item3 item4'.split /\s/g

    moveInputTo = (index) ->
      plugin.moveInputTo index
      divs = plugin.$ '> div'
      console.log divs
      expect(divs.length).toBe items.length + 1
      expect(divs[index]).toBe '.textext-tags-input'

    beforeEach ->
      done = false
      runs -> plugin.setItems items, -> done = true
      waitsFor -> done

    it 'moves input to the beginning of the item list', -> moveInputTo 0
    it 'moves input to the end of the item list', -> moveInputTo items.length
