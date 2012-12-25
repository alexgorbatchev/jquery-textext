{ KeysPlugin, Plugin } = $.fn.textext

describe 'KeysPlugin', ->
  plugin = null

  beforeEach ->
    plugin = new KeysPlugin
      element : $ '<div>'
      userOptions :
        keys :
          500 : name : 'knownkey'
          501 : name : 'trappedkey', trap : true

  it 'is registered', -> expect(Plugin.registery['keys']).toBe KeysPlugin
  it 'has default options', -> expect(KeysPlugin.defaults).toBeTruthy()

  describe 'instance', ->
    it 'is Plugin', -> expect(plugin instanceof Plugin).toBe true
    it 'is KeysPlugins', -> expect(plugin instanceof KeysPlugin).toBe true

  describe 'key down event', ->
    it 'fires for known keys', ->
      fired = false
      plugin.on 'key.down.knownkey', -> fired = true
      runs -> plugin.onKeyDown 500
      waitsFor (-> fired), 100

    it 'fires for unknown keys', ->
      fired = false
      plugin.on 'key.down.code.600', -> fired = true
      runs -> plugin.onKeyDown 600
      waitsFor (-> fired), 100

    it 'traps for known keys', -> expect(plugin.onKeyDown 501).toBe false

  describe 'key up event', ->
    it 'fires for known keys', ->
      fired = false
      plugin.on 'key.up.knownkey', -> fired = true
      runs -> plugin.onKeyUp 500
      waitsFor (-> fired), 100

    it 'fires for unknown keys', ->
      fired = false
      plugin.on 'key.up.code.600', -> fired = true
      runs -> plugin.onKeyUp 600
      waitsFor (-> fired), 100

    it 'traps for known keys', -> expect(plugin.onKeyUp 501).toBe false

  describe 'key press event', ->
    it 'fires for known keys', ->
      fired = false
      plugin.on 'key.press.knownkey', -> fired = true
      runs ->
        plugin.onKeyDown 500
        plugin.onKeyUp 500
      waitsFor (-> fired), 100

    it 'fires for unknown keys', ->
      fired = false
      plugin.on 'key.press.code.600', -> fired = true
      runs ->
        plugin.onKeyDown 600
        plugin.onKeyUp 600
      waitsFor (-> fired), 100
