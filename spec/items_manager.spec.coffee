{ ItemsManager, Plugin } = $.fn.textext

describe 'ItemsManager', ->
  plugin = null

  set = (value) ->
    done = false
    runs -> plugin.set value, (err, result) -> done = true
    waitsFor -> done

  add = (value) ->
    done = false
    runs -> plugin.add value, (err, result) -> done = true
    waitsFor -> done

  removeAt = (index) ->
    done = false
    runs -> plugin.removeAt index, (err, index, item) -> done = true
    waitsFor -> done

  toString = (value, callback) ->
    done = false
    item = null
    runs -> plugin.toString value, (err, result) ->
      item = result
      done = true
    waitsFor -> done
    runs -> callback item

  toValue = (value, callback) ->
    done = false
    item = null
    runs -> plugin.toValue value, (err, result) ->
      item = result
      done = true
    waitsFor -> done
    runs -> callback item

  find = (value, callback) ->
    done = false
    item = null
    runs -> plugin.find value, (err, result) ->
      item = result
      done = true
    waitsFor -> done
    runs -> callback item

  beforeEach -> plugin = new ItemsManager

  it 'is registered', -> expect(ItemsManager.getRegistered 'default').toBe ItemsManager
  it 'has default options', -> expect(ItemsManager.defaults).toBeTruthy()

  describe 'instance', ->
    it 'is Plugin', -> expect(plugin instanceof Plugin).toBe true
    it 'is ItemsManager', -> expect(plugin instanceof ItemsManager).toBe true

  describe '.set', ->
    it 'does not do anything with null', ->
      set null
      runs -> expect(plugin.items).toEqual []

    it 'set items from array', ->
      set [ 'item1', 'item2' ]
      runs -> expect(plugin.items).toEqual [ 'item1', 'item2' ]

  describe '.add', ->
    beforeEach -> plugin.items = []

    it 'adds item', ->
      runs -> add 'item1'
      runs -> expect(plugin.items).toEqual [ 'item1' ]

  describe '.removeAt', ->
    beforeEach -> plugin.items = [ 0, 1, 2, 3, 4 ]

    it 'removes item', ->
      runs -> removeAt '2'
      runs -> expect(plugin.items).toEqual [ 0, 1, 3, 4 ]

  describe '.toString', ->
    item = null

    describe 'default behaviour', ->
      it 'returns null for null item', ->
        runs -> toString null, (result) -> item = result
        runs -> expect(item).toBe null

      it 'returns string value', ->
        runs -> toString 'item', (result) -> item = result
        runs -> expect(item).toBe 'item'

    describe 'custom behaviour', ->
      beforeEach -> plugin.userOptions = toStringField : 'label'

      it 'returns null for null item', ->
        runs -> toString null, (result) -> item = result
        runs -> expect(item).toBe null

      it 'returns object label using `toStringField`', ->
        runs -> toString { label : 'item' }, (result) -> item = result
        runs -> expect(item).toBe 'item'

  describe '.toValue', ->
    item = null

    describe 'default behaviour', ->
      it 'returns null for null item', ->
        runs -> toValue null, (result) -> item = result
        runs -> expect(item).toBe null

      it 'returns string value', ->
        runs -> toValue 'item', (result) -> item = result
        runs -> expect(item).toBe 'item'

    describe 'custom behaviour', ->
      beforeEach -> plugin.userOptions = toValueField : 'id'

      it 'returns null for null item', ->
        runs -> toValue null, (result) -> item = result
        runs -> expect(item).toBe null

      it 'returns object label using `toValueField`', ->
        runs -> toValue { id : 'id' }, (result) -> item = result
        runs -> expect(item).toBe 'id'

  describe '.search', ->
    beforeEach -> plugin.items = [ 'item1', 'item2', 'foo', 'bar' ]

    it 'finds items by matching string', ->
      foundItems = null
      runs -> plugin.search 'item', (err, items) -> foundItems = items
      waitsFor -> foundItems
      runs -> expect(foundItems).toEqual [ 'item1', 'item2' ]

  describe '.find', ->
    items = item = null

    describe 'default behaviour', ->
      beforeEach -> plugin.items = [ 'item1', 'item2' ]

      it 'returns null for null item', ->
        runs -> find null, (result) -> item = result
        runs -> expect(item).toBe null

      it 'returns string value when found', ->
        runs -> find 'item1', (result) -> item = result
        runs -> expect(item).toBe 'item1'

      it 'returns null when not found', ->
        runs -> find 'unknown', (result) -> item = result
        runs -> expect(item).toBe null

    describe 'custom behaviour', ->
      beforeEach ->
        plugin.userOptions = toStringField : 'label'
        plugin.items = [
          { id : 'id1', label : 'item1' }
          { id : 'id2', label : 'item2' }
          { id : 'id3', label : 'item2' }
        ]

      it 'returns null for null item', ->
        runs -> find null, (result) -> item = result
        runs -> expect(item).toBe null

      it 'returns first object that matches value using `toStringField`', ->
        runs -> find 'item2', (result) -> item = result
        runs -> expect(item).toEqual { id : 'id2', label : 'item2' }

      it 'returns null when not found', ->
        runs -> find 'unknown', (result) -> item = result
        runs -> expect(item).toBe null
