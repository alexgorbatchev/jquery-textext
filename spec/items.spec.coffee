{ Items, Plugin } = $.fn.textext

describe 'Items', ->
  plugin = null

  set = (value) ->
    done = false
    runs -> plugin.set value, (err, result) -> done = true
    waitsFor (-> done), 250

  add = (value) ->
    done = false
    runs -> plugin.add value, (err, result) -> done = true
    waitsFor (-> done), 250

  removeAt = (index) ->
    done = false
    runs -> plugin.removeAt index, (err, index, item) -> done = true
    waitsFor (-> done), 250

  toString = (value, callback) ->
    done = false
    item = null
    runs -> plugin.toString value, (err, result) ->
      item = result
      done = true
    waitsFor (-> done), 250
    runs -> callback item

  toValue = (value, callback) ->
    done = false
    item = null
    runs -> plugin.toValue value, (err, result) ->
      item = result
      done = true
    waitsFor (-> done), 250
    runs -> callback item

  find = (value, callback) ->
    done = false
    item = null
    runs -> plugin.find value, (err, result) ->
      item = result
      done = true
    waitsFor (-> done), 250
    runs -> callback item

  it 'is registered', -> expect(Items.getRegistered 'default').toBe Items
  it 'has default options', -> expect(Items.defaults).toBeTruthy()

  describe 'instance', ->
    beforeEach -> plugin = new Items

    it 'is Plugin', -> expect(plugin instanceof Plugin).toBe true
    it 'is Items', -> expect(plugin instanceof Items).toBe true

  describe '.set', ->
    beforeEach ->
      plugin = new Items
      set [ 'item1', 'item2' ]

    it 'set items', -> expect(plugin.items).toEqual [ 'item1', 'item2' ]

  describe '.add', ->
    beforeEach ->
      plugin = new Items
      plugin.items = []
      add 'item1'

    it 'adds item', -> expect(plugin.items).toEqual [ 'item1' ]

  describe '.removeAt', ->
    beforeEach ->
      plugin = new Items
      plugin.items = [ 0, 1, 2, 3, 4 ]
      removeAt '2'

    it 'removes item', -> expect(plugin.items).toEqual [ 0, 1, 3, 4 ]

  describe '.toString', ->
    item = null

    describe 'default behaviour', ->
      beforeEach -> plugin = new Items

      it 'returns null for null item', ->
        toString null, (result) -> item = result
        runs -> expect(item).toBe null

      it 'returns string value', ->
        toString 'item', (result) -> item = result
        runs -> expect(item).toBe 'item'

    describe 'custom behaviour', ->
      beforeEach -> plugin = new Items userOptions : toStringField : 'label'

      it 'returns null for null item', ->
        toString null, (result) -> item = result
        runs -> expect(item).toBe null

      it 'returns object label using `toStringField`', ->
        toString { label : 'item' }, (result) -> item = result
        runs -> expect(item).toBe 'item'

  describe '.toValue', ->
    item = null

    describe 'default behaviour', ->
      beforeEach -> plugin = new Items

      it 'returns null for null item', ->
        toValue null, (result) -> item = result
        runs -> expect(item).toBe null

      it 'returns string value', ->
        toValue 'item', (result) -> item = result
        runs -> expect(item).toBe 'item'

    describe 'custom behaviour', ->
      beforeEach -> plugin = new Items userOptions : toValueField : 'id'

      it 'returns null for null item', ->
        toValue null, (result) -> item = result
        runs -> expect(item).toBe null

      it 'returns object label using `toValueField`', ->
        toValue { id : 'id' }, (result) -> item = result
        runs -> expect(item).toBe 'id'

  describe '.find', ->
    items = item = null

    describe 'default behaviour', ->
      beforeEach ->
        plugin = new Items
        plugin.items = [ 'item1', 'item2' ]

      it 'returns null for null item', ->
        find null, (result) -> item = result
        runs -> expect(item).toBe null

      it 'returns string value when found', ->
        find 'item1', (result) -> item = result
        runs -> expect(item).toBe 'item1'

      it 'returns null when not found', ->
        find 'unknown', (result) -> item = result
        runs -> expect(item).toBe null

    describe 'custom behaviour', ->
      beforeEach ->
        plugin = new Items userOptions : toStringField : 'label'
        plugin.items = [
          { id : 'id1', label : 'item1' }
          { id : 'id2', label : 'item2' }
          { id : 'id3', label : 'item2' }
        ]

      it 'returns null for null item', ->
        find null, (result) -> item = result
        runs -> expect(item).toBe null

      it 'returns first object that matches value using `toStringField`', ->
        find 'item2', (result) -> item = result
        runs -> expect(item).toEqual { id : 'id2', label : 'item2' }

      it 'returns null when not found', ->
        find 'unknown', (result) -> item = result
        runs -> expect(item).toBe null
