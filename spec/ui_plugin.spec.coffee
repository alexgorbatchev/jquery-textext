{ UIPlugin } = $.fn.textext

describe 'UIPlugin', ->
  plugin = null

  beforeEach ->
    plugin = new UIPlugin element : $ '<div class="plugin"/>'

  describe 'instance', ->
    it 'is UIPlugin', -> expect(plugin).to.be.instanceof UIPlugin

  describe '.init', ->
    describe 'with parent', ->
      it 'adds itself to parent', ->
        parent = new UIPlugin element : $ '<div class="parent">'
        plugin = new UIPlugin parent : parent, element : $ '<div class="plugin"/>'
        plugin.init()
        expect(plugin.element.parent()).to.be parent.element

  describe '.appendToParent', ->
    parent = null

    beforeEach ->
      parent = new UIPlugin element : $ '<div class="parent"/>'
      plugin = new UIPlugin element : $ '<div class="plugin"/>'

    it 'appends own element to parent when present', ->
      plugin.parent = parent
      plugin.appendToParent()
      expect(plugin.element.parent()).to.be parent.element

    it 'does nothing without parent', ->
      plugin.parent = null
      plugin.appendToParent()
      expect(plugin.element.parent()).not.to.be parent.element
