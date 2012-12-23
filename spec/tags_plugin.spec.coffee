{ TagsPlugin, Plugin } = $.fn.textext

describe 'TagsPlugin', ->
  plugin = null

  it 'is registered', -> expect(Plugin.registery['tags']).toBe TagsPlugin

  describe 'instance', ->
    beforeEach -> plugin = new TagsPlugin()

    it 'is Plugin', -> expect(plugin instanceof Plugin).toBe true
    it 'is TagsPlugins', -> expect(plugin instanceof TagsPlugin).toBe true
    it 'has default options', -> expect(plugin.options)

