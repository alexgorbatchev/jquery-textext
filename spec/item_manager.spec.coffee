{ ItemManager, Plugin } = $.fn.textext

describe 'ItemManager', ->
  plugin = parent = null

  getItems = (opts, callback) ->
    done = false
    items = null
    runs -> plugin.getItems opts, (err, result) ->
      items = result
      done = true
    waitsFor (-> done), 250
    runs -> callback items

  itemToString = (value, callback) ->
    done = false
    item = null
    runs -> plugin.itemToString value, (err, result) ->
      item = result
      done = true
    waitsFor (-> done), 250
    runs -> callback item

  itemToValue = (value, callback) ->
    done = false
    item = null
    runs -> plugin.itemToValue value, (err, result) ->
      item = result
      done = true
    waitsFor (-> done), 250
    runs -> callback item

  stringToItem = (value, items, callback) ->
    done = false
    item = null
    runs -> plugin.stringToItem value, items, (err, result) ->
      item = result
      done = true
    waitsFor (-> done), 250
    runs -> callback item

  it 'is registered', -> expect(Plugin.getRegistered 'item_manager').toBe ItemManager
  it 'has default options', -> expect(ItemManager.defaults).toBeTruthy()

  describe 'instance', ->
    beforeEach ->
      plugin = new ItemManager

    it 'is Plugin', -> expect(plugin instanceof Plugin).toBe true
    it 'is ItemManager', -> expect(plugin instanceof ItemManager).toBe true

  describe '.getItems', ->
    items = null

    beforeEach ->
      parent = new Plugin userOptions : items : [ 'item1', 'item2' ]
      plugin = new ItemManager parent : parent
      getItems null, (result) -> items = result

    it 'get items from parent `items` option', -> expect(items).toEqual [ 'item1', 'item2' ]

  describe '.itemToString', ->
    item = null

    describe 'default behaviour', ->
      beforeEach -> plugin = new ItemManager

      it 'returns null for null item', ->
        itemToString null, (result) -> item = result
        runs -> expect(item).toBe null

      it 'returns string value', ->
        itemToString 'item', (result) -> item = result
        runs -> expect(item).toBe 'item'

    describe 'custom behaviour', ->
      beforeEach -> plugin = new ItemManager userOptions : toStringField : 'label'

      it 'returns null for null item', ->
        itemToString null, (result) -> item = result
        runs -> expect(item).toBe null

      it 'returns object label using `toStringField`', ->
        itemToString { label : 'item' }, (result) -> item = result
        runs -> expect(item).toBe 'item'

  describe '.itemToValue', ->
    item = null

    describe 'default behaviour', ->
      beforeEach -> plugin = new ItemManager

      it 'returns null for null item', ->
        itemToValue null, (result) -> item = result
        runs -> expect(item).toBe null

      it 'returns string value', ->
        itemToValue 'item', (result) -> item = result
        runs -> expect(item).toBe 'item'

    describe 'custom behaviour', ->
      beforeEach -> plugin = new ItemManager userOptions : toValueField : 'id'

      it 'returns null for null item', ->
        itemToValue null, (result) -> item = result
        runs -> expect(item).toBe null

      it 'returns object label using `toValueField`', ->
        itemToValue { id : 'id' }, (result) -> item = result
        runs -> expect(item).toBe 'id'

  describe '.stringToItem', ->
    items = item = null

    describe 'default behaviour', ->
      beforeEach ->
        items = [ 'item1', 'item2' ]
        plugin = new ItemManager

      it 'returns null for null item', ->
        stringToItem null, items, (result) -> item = result
        runs -> expect(item).toBe null

      it 'returns string value when found', ->
        stringToItem 'item1', items, (result) -> item = result
        runs -> expect(item).toBe 'item1'

      it 'returns null when not found', ->
        stringToItem 'unknown', items, (result) -> item = result
        runs -> expect(item).toBe null

    describe 'custom behaviour', ->
      beforeEach ->
        items = [
          { id : 'id1', label : 'item1' }
          { id : 'id2', label : 'item2' }
          { id : 'id3', label : 'item2' }
        ]
        plugin = new ItemManager userOptions : toStringField : 'label'

      it 'returns null for null item', ->
        stringToItem null, items, (result) -> item = result
        runs -> expect(item).toBe null

      it 'returns first object that matches value using `toStringField`', ->
        stringToItem 'item2', items, (result) -> item = result
        runs -> expect(item).toEqual { id : 'id2', label : 'item2' }

      it 'returns null when not found', ->
        stringToItem 'unknown', items, (result) -> item = result
        runs -> expect(item).toBe null
