{ Plugin, TextExt } = $.fn.textext

describe 'TextExt', ->
  textext = null

  describe 'instance', ->
    beforeEach -> textext = new TextExt element : $('<div>')
    it 'is Plugin', -> expect(textext instanceof Plugin).toBe true
    it 'is TextExt', -> expect(textext instanceof TextExt).toBe true

  describe 'jQuery plugin', ->
    select = $ '<select/>'
    it 'creates the plugin and returns correct chain', -> expect(select.textext().html()).toEqual select.html()
    it 'returns the plugin instance', -> expect(select.textext(instance : true) instanceof TextExt).toBe true
    it 'hides target element', -> expect(select).not.toBe ':visible'

