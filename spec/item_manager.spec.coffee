{ ItemManager, Plugin } = $.fn.textext

describe 'ItemManager', ->
  plugin = null

  getItems = (callback) ->
    done = false
    items = null
    runs -> plugin.getItems (err, result) ->
      items = result
      done = true
    waitsFor (-> done), 250
    runs -> callback items

  setItems = (value, callback) ->
    done = false
    items = null
    runs -> plugin.setItems value, (err, result) ->
      items = result
      done = true
    waitsFor (-> done), 250
    runs -> callback items

  addItem = (value, callback) ->
    done = false
    items = null
    runs -> plugin.addItem value, (err, result) ->
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

  stringToItem = (value, callback) ->
    done = false
    item = null
    runs -> plugin.stringToItem value, (err, result) ->
      item = result
      done = true
    waitsFor (-> done), 250
    runs -> callback item

  it 'is registered', -> expect(ItemManager.getRegistered 'default').toBe ItemManager
  it 'has default options', -> expect(ItemManager.defaults).toBeTruthy()

  describe 'instance', ->
    beforeEach -> plugin = new ItemManager

    it 'is Plugin', -> console.log plugin instanceof Plugin; expect(plugin instanceof Plugin).toBe true
    it 'is ItemManager', -> expect(plugin instanceof ItemManager).toBe true

  describe '.getItems', ->
    items = null

    beforeEach ->
      parent = new Plugin userOptions : items : [ 'item1', 'item2' ]
      plugin = new ItemManager parent : parent
      getItems (result) -> items = result

    it 'get items from parent `items` option', -> expect(items).toEqual [ 'item1', 'item2' ]

  describe '.setItems', ->
    beforeEach ->
      plugin = new ItemManager
      setItems [ 'item1', 'item2' ], (result) -> null

    it 'set items', -> expect(plugin.items).toEqual [ 'item1', 'item2' ]

  describe '.addItem', ->
    beforeEach ->
      plugin = new ItemManager
      addItem 'item1', (result) -> null

    it 'adds item', -> expect(plugin.items).toEqual [ 'item1' ]

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
        plugin = new ItemManager
        plugin.items = [ 'item1', 'item2' ]

      it 'returns null for null item', ->
        stringToItem null, (result) -> item = result
        runs -> expect(item).toBe null

      it 'returns string value when found', ->
        stringToItem 'item1', (result) -> item = result
        runs -> expect(item).toBe 'item1'

      it 'returns null when not found', ->
        stringToItem 'unknown', (result) -> item = result
        runs -> expect(item).toBe null

    describe 'custom behaviour', ->
      beforeEach ->
        plugin = new ItemManager userOptions : toStringField : 'label'
        plugin.items = [
          { id : 'id1', label : 'item1' }
          { id : 'id2', label : 'item2' }
          { id : 'id3', label : 'item2' }
        ]

      it 'returns null for null item', ->
        stringToItem null, (result) -> item = result
        runs -> expect(item).toBe null

      it 'returns first object that matches value using `toStringField`', ->
        stringToItem 'item2', (result) -> item = result
        runs -> expect(item).toEqual { id : 'id2', label : 'item2' }

      it 'returns null when not found', ->
        stringToItem 'unknown', (result) -> item = result
        runs -> expect(item).toBe null
