{ UIPlugin } = $.fn.textext

describe 'UIPlugin', ->
  parent = plugin = null

  beforeEach ->
    parent = new UIPlugin element : $ '<div class="parent"/>'
    plugin = new UIPlugin parent : parent, element : $ '<div class="plugin"/>'

  describe 'instance', ->
    it 'is UIPlugin', -> expect(plugin instanceof UIPlugin).toBe true

  describe '.appendToParent', ->
    beforeEach -> plugin.appendToParent()
    it 'appends own element to parent\'s', -> expect(parent.element).toContain plugin.element
