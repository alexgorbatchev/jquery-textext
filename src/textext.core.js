(function($, undefined)
{
	function TextExt() {};
	function ItemManager() {};

	var stringify = (JSON || {}).stringify,
		slice     = Array.prototype.slice,

		UNDEFINED = 'undefined',

		OPT_ENABLED      = 'enabled',
		OPT_ITEM_MANAGER = 'item.manager',
		OPT_PLUGINS      = 'plugins',
		OPT_EXT          = 'ext',
		OPT_HTML_WRAP    = 'html.wrap',
		OPT_KEYS         = 'keys',

		EVENT_PRE_INVALIDATE  = 'preInvalidate',
		EVENT_POST_INVALIDATE = 'postInvalidate',
		EVENT_SET_DATA        = 'setData',
		EVENT_POST_INIT       = 'postInit',
		EVENT_READY           = 'ready',

		DEFAULT_OPTS = {
			enabled : true,
			itemManager : ItemManager,

			plugins : [],
			ext : {},

			html : {
				wrap : '<div class="text-core"><div class="text-wrap"/></div>'
			},

			keys : {
				8   : 'Backspace',
				9   : 'Tab',
				13  : 'Enter!',
				27  : 'Escape!',
				37  : 'Left',
				38  : 'Up!',
				39  : 'Right',
				40  : 'Down!',
				46  : 'Delete',
				108 : 'NumpadEnter',
				188 : 'Comma'
			}
		}
		;

	/**
	 * Returns object property by name where name is dot-separated and object is multiple levels deep.
	 * @param target Object Source object.
	 * @param name String Dot separated property name, ie `foo.bar.world`
	 */
	function getProperty(source, name)
	{
		if(typeof(name) == 'string')
			name = name.split('.');

		var fullCamelCaseName = name.join('.').replace(/\.(\w)/g, function(match, letter) { return letter.toUpperCase() }),
			nestedName        = name.shift(),
			result            = source[fullCamelCaseName] || source[nestedName]
			;

		return name.length == 0 || result == null ? result : getProperty(result, name);
	};

	/**
	 * Hooks up specified events in the scope of the current object.
	 * @author agorbatchev
	 * @date 2011/08/09
	 */
	function hookupEvents(args)
	{
		var self  = this,
			input = self.input(),
			event
			;

		for(event in args)
			(function(self, event, handler)
			{
				input.bind(event, function()
				{
					return handler.apply(self, arguments);
				});
			})(self, event, args[event]);
	};

	//--------------------------------------------------------------------------------
	// TextExt core component
	
	p = ItemManager.prototype;

	p.init = function(core)
	{
	};

	p.filter = function(list, query)
	{
		var result = [],
			i, item
			;

		for(i = 0; i < list.length; i++)
		{
			item = list[i];
			if(this.itemContains(item, query))
				result.push(item);
		}

		return result;
	};

	p.itemContains = function(item, needle)
	{
		return this.itemToString(item).toLowerCase().indexOf(needle.toLowerCase()) == 0;
	};

	p.stringToItem = function(str)
	{
		return str;
	};

	p.itemToString = function(item)
	{
		return item;
	};

	p.compareItems = function(item1, item2)
	{
		return item1 == item2;
	};

	//--------------------------------------------------------------------------------
	// TextExt core component

	p = TextExt.prototype;
		
	p.init = function(input, opts)
	{
		var self = this,
			originalInput,
			itemManager
			;

		input               = $(input);
		self._defaults      = $.extend({}, DEFAULT_OPTS);
		self._opts          = opts || {};
		self._plugins       = {};
		self._originalInput = originalInput = input;
		self._itemManager   = itemManager = new (self.opts(OPT_ITEM_MANAGER))();

		input = input.clone().insertAfter(originalInput);
		
		// hide original input field
		originalInput.hide();

		// clear certain attributes from the clone
		input
			.attr('id', null)
			.attr('name', null)
			;

		self._input = input;

		input
			.wrap(self.opts(OPT_HTML_WRAP))
			.keydown(function(e) { return self.onKeyDown(e) })
			.keyup(function(e) { return self.onKeyUp(e) })
			.data('textext', self)
			;

		$.extend(true, itemManager, self.opts(OPT_EXT + '.itemManager'));
		$.extend(true, self, self.opts(OPT_EXT + '.*'), self.opts(OPT_EXT + '.core'));
		
		self.originalWidth = input.outerWidth();

		self.invalidateBounds();
		itemManager.init(self);
		self.initPlugins(self.opts(OPT_PLUGINS));
		self.on({
			setData  : self.onSetData,
			anyKeyUp : self.onAnyKeyUp
		});

		// `postInit` is fired to let plugins and users to run code after all plugins
		// have been created and initialized. This is a good place to set some kind
		// of global values before somebody gets to use them.
		self.trigger(EVENT_POST_INIT);

		// `ready` is fired after all global configuration and prepearation has been
		// done and the TextExt component is ready to use. Event handlers should
		// expect all values to be set and the plugins to be in the final state.
		self.trigger(EVENT_READY);
	};

	p.initPlugins = function(plugins)
	{
		var self = this,
			ext, name, plugin
			;

		if(typeof(plugins) == 'string')
			plugins = plugins.split(/\s*,\s*|\s+/g);

		for(var i = 0; i < plugins.length, name = plugins[i]; i++)
		{
			plugin = $.fn.textext.plugins[name];

			if(plugin)
			{
				plugin              = new plugin();
				ext                 = self.opts(OPT_EXT);
				self._plugins[name] = plugin;

				$.extend(true, plugin, ext['*'], ext[name]);
				plugin.init(self);
			}
		}
	};

	p.on = hookupEvents;

	p.bind = function(event, handler)
	{
		this.input().bind(event, handler);
	};

	p.trigger = function()
	{
		this.input().trigger(arguments[0], slice.call(arguments, 1));
	};

	p.itemManager = function()
	{
		return this._itemManager;
	};

	/**
	 * Returns jQuery input element with which user is interacting.
	 * @author agorbatchev
	 * @date 2011/08/10
	 */
	p.input = function()
	{
		return this._input;
	};

	p.opts = function(name)
	{
		var result = getProperty(this._opts, name);
		return typeof(result) == 'undefined' ? getProperty(this._defaults, name) : result;
	};

	p.getWrapContainer = function()
	{
		return this.input().parent();
	};

	p.invalidateBounds = function()
	{
		var self      = this,
			input     = self.input(),
			wrap      = self.getWrapContainer(),
			container = wrap.parent(),
			width     = self.originalWidth,
			height
			;

		self.trigger(EVENT_PRE_INVALIDATE);

		height = input.outerHeight();

		input.width(width);
		wrap.width(width).height(height);
		container.height(height);

		self.trigger(EVENT_POST_INVALIDATE);
	};

	p.focusInput = function()
	{
		this.input()[0].focus();
	};

	/**
	 * Serializes data for the default `setData` event handler.
	 *
	 * By default simple JSON serialization is used. It's expected that `JSON.stringify`
	 * method would be available either through built in class in most modern browsers
	 * or through JSON2 library.
	 *
	 * @author agorbatchev
	 * @date 2011/08/09
	 */
	p.serializeData = function(data)
	{
		return stringify ? stringify(data) : 'JSON.stringify() not found';
	};

	/**
	 * Returns current value contained in the original text input field. This value
	 * is typically set during `setData` event handling/dispatching.
	 * @author agorbatchev
	 * @date 2011/08/09
	 */
	p.getData = function()
	{
		return this._originalInput.val();
	};

	/**
	 * Returns flag indicating whether or not serialized data returned by `getData` 
	 * actually contains any value. Example of this would be an empty string, array
	 * or object which would be `""`, `[]` and `{}` respectively. While they represent
	 * empty values, their string representation isn't zero length or null.
	 *
	 * @author agorbatchev
	 * @date 2011/08/10
	 */
	p.hasData = function()
	{
		return this._isDataEmpty != true;
	};

	/**
	 * Returns true if `enabled` option is true.
	 * @author agorbatchev
	 * @date 2011/08/10
	 */
	p.enabled = function()
	{
		return this.opts(OPT_ENABLED) === true;
	};

	//--------------------------------------------------------------------------------
	// Event handlers

	p.onAnyKeyUp = function(e)
	{
		var self = this,
			value = self.input().val()
			;

		if(self.enabled())
			self.trigger(EVENT_SET_DATA, value, value.length == 0)
	};

	/**
	 * Reacts to `setData` event. Recieves data from plugins which should be
	 * popuplated into the original text input with expactation that it will
	 * be either submitted or retrieved in some fashion.
	 *
	 * Relies on `serializeData` to serialize all data.
	 *
	 * @param e {Event} jQuery event.
	 * @param data {Object} Data in any format passed from a plugin. The data will
	 * be serialized using `serializeData` method.
	 * @param isEmpty {Boolean} A flag indicating if the data is empty. Because passed
	 * could be in any shape, there is no way to determine if it's empty, therefore
	 * it's up to plugins to specify.
	 *
	 * @author agorbatchev
	 * @date 2011/08/09
	 */
	p.onSetData = function(e, data, isEmpty)
	{
		var self = this;

		data = self.serializeData(data);
		self._originalInput.val(data);
		self._isDataEmpty = isEmpty == true;
	};

	//--------------------------------------------------------------------------------
	// User mouse/keyboard input
	
	$(['Down', 'Up']).each(function()
	{
		var type = this.toString();

		p['onKey' + type] = function(e)
		{
			var self          = this,
				keyName       = self.opts(OPT_KEYS)[e.keyCode] || 'Other',
				eventName     = keyName.replace('!', '') + 'Key' + type,
				defaultResult = keyName.substr(-1) != '!'
				;

			self.trigger('anyKey' + type, e);
			self.trigger(eventName.charAt(0).toLowerCase() + eventName.substring(1));

			return defaultResult;
		};
	});

	//--------------------------------------------------------------------------------
	// Plugin Base
	
	function TextExtPlugin()
	{
	};

	p = TextExtPlugin.prototype;

	p.on = hookupEvents;

	p.baseInit = function(core, defaults)
	{
		core._defaults = $.extend(true, core._defaults, defaults);
		p._core = core;
	};

	p.core = function()
	{
		return this._core;
	};

	p.opts = function(name)
	{
		return this.core().opts(name);
	};

	p.itemManager = function()
	{
		return this.core().itemManager();
	};

	p.input = function()
	{
		return this.core().input();
	};

	p.trigger = function()
	{
		var core = this.core();
		core.trigger.apply(core, arguments);
	};

	//--------------------------------------------------------------------------------
	// jQuery Integration
	
	var textext = $.fn.textext = function(opts)
	{
		return this.map(function()
		{
			var self = $(this);

			if(opts == null)
				return self.data('textext');

			var instance = new TextExt();

			instance.init(self, opts);
			self.data('textext', instance);

			return instance.input()[0];
		});
	};

	textext.addPlugin = function(name, constructor)
	{
		textext.plugins[name]  = constructor;
		constructor.prototype = new textext.TextExtPlugin();
	};

	textext.TextExt       = TextExt;
	textext.TextExtPlugin = TextExtPlugin;
	textext.ItemManager   = ItemManager;
	textext.plugins       = {};
})(jQuery);
