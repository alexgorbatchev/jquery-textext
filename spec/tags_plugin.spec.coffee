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

    it 'creates tag elements', -> expect(plugin.$('.textext-tag').length).toBe items.length

    it '...', ->
      null
