{ Plugin, TextExt } = $.fn.textext

describe 'TextExt', ->
  select = textext = null

  describe 'instance', ->
    beforeEach -> textext = new TextExt()

    it 'is TextExt', -> expect(textext instanceof TextExt).toBe true

  describe 'jQuery plugin', ->
    select = $ '<select/>'
    it 'creates the plugin', -> expect(select.textext().html()).toEqual select.html()
    it 'returns the plugin instance', -> expect(select.textext(instance : true) instanceof TextExt).toBe true

  describe 'for <select/>', ->
    it 'starts in autocomplete mode', ->
      textext = new TextExt(select)
