{ ItemsManager, Plugin } = $.fn.textext

describe 'ItemsManager', ->
  plugin = null

  beforeEach -> plugin = new ItemsManager

  it 'has default options', -> expect(ItemsManager.defaults).to.be.ok

  describe 'instance', ->
    it 'is Plugin', -> expect(plugin).to.be.instanceof Plugin
    it 'is ItemsManager', -> expect(plugin).to.be.instanceof ItemsManager

  describe '.set', ->
    it 'does not do anything with null', (done) ->
      plugin.set(null).done ->
        expect(plugin.items).to.eql []
        done()

    it 'set items from array', (done) ->
      plugin.set([ 'item1', 'item2' ]).done ->
        expect(plugin.items).to.eql [ 'item1', 'item2' ]
        done()

  describe '.add', ->
    beforeEach -> plugin.items = []

    it 'adds item', (done) ->
      plugin.add('item1').done ->
        expect(plugin.items).to.eql [ 'item1' ]
        done()

  describe '.removeAt', ->
    beforeEach -> plugin.items = [ 0, 1, 2, 3, 4 ]

    it 'removes item', (done) ->
      plugin.removeAt(2).done ->
        expect(plugin.items).to.eql [ 0, 1, 3, 4 ]
        done()

  describe '.toString', ->
    describe 'default behaviour', ->
      it 'returns null for null item', (done) ->
        plugin.toString(null).done (result) ->
          expect(result).to.be.null
          done()

      it 'returns string value', (done) ->
        plugin.toString('item').done (result) ->
          expect(result).to.equal 'item'
          done()

    describe 'custom behaviour', ->
      beforeEach -> plugin.userOptions = toStringField : 'label'

      it 'returns null for null item', (done) ->
        plugin.toString(null).done (result) ->
          expect(result).to.be.null
          done()

      it 'returns object label using `toStringField`', (done) ->
        plugin.toString({ label : 'item' }).done (result) ->
          expect(result).to.equal 'item'
          done()

  describe '.toValue', ->
    describe 'default behaviour', ->
      it 'returns null for null item', (done) ->
        plugin.toValue(null).done (result) ->
          expect(result).to.be.null
          done()

      it 'returns string value', (done) ->
        plugin.toValue('item').done (result) ->
          expect(result).to.equal 'item'
          done()

    describe 'custom behaviour', ->
      beforeEach -> plugin.userOptions = toValueField : 'id'

      it 'returns null for null item', (done) ->
        plugin.toValue(null).done (result) ->
          expect(result).to.be.null
          done()

      it 'returns object label using `toValueField`', (done) ->
        plugin.toValue({ id : 'id' }).done (result) ->
          expect(result).to.equal 'id'
          done()

  describe '.search', ->
    it 'returns all items when search string is empty', (done) ->
      plugin.items = [ 'item1', 'item2', 'foo', 'bar' ]
      plugin.search('').done (result) ->
        expect(result).to.eql [ 'item1', 'item2', 'foo', 'bar' ]
        done()

    it 'returns items which match the search string', (done) ->
      plugin.items = [ 'item1', 'item2', 'foo', 'bar' ]
      plugin.search('item').done (result) ->
        expect(result).to.eql [ 'item1', 'item2' ]
        done()

