{ Plugin, TextExt } = $.fn.textext

describe 'TextExt', ->
  textext = null

  describe 'instance', ->
    beforeEach -> textext = new TextExt element : $('<div>')
    it 'is Plugin', -> expect(textext).to.be.instanceof Plugin
    it 'is TextExt', -> expect(textext).to.be.instanceof TextExt

  describe 'jQuery plugin', ->
    select = $ '<select/>'
    it 'creates the plugin and returns correct chain', -> expect(select.textext().html()).to.equal select.html()
    it 'returns the plugin instance', -> expect(select.textext(instance : true)).to.be.instanceof TextExt
    it 'hides target element', -> expect(select).not.to.equal ':visible'

