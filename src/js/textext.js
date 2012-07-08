/**
 * jQuery TextExt Plugin
 * http://textextjs.com
 *
 * @version 1.3.0
 * @copyright Copyright (C) 2011 Alex Gorbatchev. All rights reserved.
 * @license MIT License
 */
(function($, undefined)
{
	// Freak out if there's no JSON.stringify function found
	if(!JSON.stringify)
		throw new Error('TextExt.js: `JSON.stringify()` not found');

	/**
	 * TextExt is the main core class which by itself doesn't provide any functionality
	 * that is user facing, however it has the underlying mechanics to bring all the
	 * plugins together under one roof and make them work with each other or on their
	 * own.
	 *
	 * @author agorbatchev
	 * @date 2011/08/19
	 * @id TextExt
	 */
	function TextExt() {};

	var slice     = Array.prototype.slice,
		UNDEFINED = 'undefined',
		p,

		/**
		 * TextExt provides a way to pass in the options to configure the core as well as
		 * each plugin that is being currently used. The jQuery exposed plugin `$().textext()` 
		 * function takes a hash object with key/value set of options. For example:
		 *
		 *     $('textarea').textext({
		 *         enabled: true
		 *     })
		 *
		 * There are multiple ways of passing in the options:
		 *
		 * 1. Options could be nested multiple levels deep and accessed using all lowercased, dot
		 * separated style, eg `foo.bar.world`. The manual is using this style for clarity and
		 * consistency. For example:
		 *
		 *        {
		 *            item: {
		 *                manager: ...
		 *            },
		 *
		 *            html: {
		 *                wrap: ...
		 *            },
		 *
		 *            autocomplete: {
		 *                enabled: ...,
		 *                dropdown: {
		 *                   position: ...
		 *                }
		 *            }
		 *        }
		 *
		 * 2. Options could be specified using camel cased names in a flat key/value fashion like so:
		 *
		 *        {
		 *            itemManager: ...,
		 *            htmlWrap: ...,
		 *            autocompleteEnabled: ...,
		 *            autocompleteDropdownPosition: ...
		 *        }
		 *
		 * 3. Finally, options could be specified in mixed style. It's important to understand that
		 * for each dot separated name, its alternative in camel case is also checked for, eg for 
		 * `foo.bar.world` it's alternatives could be `fooBarWorld`, `foo.barWorld` or `fooBar.world`, 
		 * which translates to `{ foo: { bar: { world: ... } } }`, `{ fooBarWorld: ... }`, 
		 * `{ foo : { barWorld : ... } }` or `{ fooBar: { world: ... } }` respectively. For example:
		 *
		 *        {
		 *            itemManager : ...,
		 *            htmlWrap: ...,
		 *            autocomplete: {
		 *                enabled: ...,
		 *                dropdownPosition: ...
		 *            }
		 *        }
		 *
		 * Mixed case is used through out the code, wherever it seems appropriate. However in the code, all option
		 * names are specified in the dot notation because it works both ways where as camel case is not
		 * being converted to its alternative dot notation.
		 *
		 * @author agorbatchev
		 * @date 2011/08/17
		 * @id TextExt.options
		 */

		/**
		 * Default instance of `ItemManager` which takes `String` type as default for tags.
		 *
		 * @name item.manager
		 * @default ItemManager
		 * @author agorbatchev
		 * @date 2011/08/19
		 * @id TextExt.options.item.manager
		 */
		OPT_ITEM_MANAGER = 'item.manager',
		
		/**
		 * List of plugins that should be used with the current instance of TextExt. The list could be
		 * specified as array of strings or as comma or space separated string.
		 *
		 * @name plugins
		 * @default []
		 * @author agorbatchev
		 * @date 2011/08/19
		 * @id TextExt.options.plugins
		 */
		OPT_PLUGINS = 'plugins',
		
		OPT_DATA_SOURCE = 'dataSource',

		/**
		 * TextExt allows for overriding of virtually any method that the core or any of its plugins
		 * use. This could be accomplished through the use of the `ext` option.
		 *
		 * It's possible to specifically target the core or any plugin, as well as overwrite all the
		 * desired methods everywhere.
		 *
		 * 1. Targeting the core:
		 *
		 *        ext: {
		 *            core: {
		 *                trigger: function()
		 *                {
		 *                    console.log('TextExt.trigger', arguments);
		 *                    $.fn.textext.TextExt.prototype.trigger.apply(this, arguments);
		 *                }
		 *            }
		 *        }
		 *
		 * 2. Targeting individual plugins:
		 *
		 *        ext: {
		 *            tags: {
		 *                addTags: function(tags)
		 *                {
		 *                    console.log('TextExtTags.addTags', tags);
		 *                    $.fn.textext.TextExtTags.prototype.addTags.apply(this, arguments);
		 *                }
		 *            }
		 *        }
		 *
		 * 3. Targeting `ItemManager` instance:
		 *
		 *        ext: {
		 *            itemManager: {
		 *                stringToItem: function(str)
		 *                {
		 *                    console.log('ItemManager.stringToItem', str);
		 *                    return $.fn.textext.ItemManager.prototype.stringToItem.apply(this, arguments);
		 *                }
		 *            }
		 *        }
		 *
		 * 4. And finally, in edge cases you can extend everything at once:
		 *
		 *        ext: {
		 *            '*': {
		 *                fooBar: function() {}
		 *            }
		 *        }
		 *
		 * @name ext
		 * @default {}
		 * @author agorbatchev
		 * @date 2011/08/19
		 * @id TextExt.options.ext
		 */
		OPT_EXT = 'ext',
		
		/**
		 * HTML source that is used to generate elements necessary for the core and all other
		 * plugins to function.
		 *
		 * @name html.wrap
		 * @default '<div class="text-core"><div class="text-wrap"/></div>'
		 * @author agorbatchev
		 * @date 2011/08/19
		 * @id TextExt.options.html.wrap
		 */
		OPT_HTML_WRAP = 'html.wrap',

		/**
		 * HTML source that is used to generate hidden input value of which will be submitted 
		 * with the HTML form.
		 *
		 * @name html.hidden
		 * @default '<input type="hidden" />'
		 * @author agorbatchev
		 * @date 2011/08/20
		 * @id TextExt.options.html.hidden
		 */
		OPT_HTML_HIDDEN = 'html.hidden',
		
		/**
		 * Hash table of key codes and key names for which special events will be created
		 * by the core. For each entry a `[name]KeyDown`, `[name]KeyUp` and `[name]KeyPress` events 
		 * will be triggered along side with `anyKeyUp` and `anyKeyDown` events for every 
		 * key stroke.
		 *
		 * Here's a list of default keys:
		 *
		 *     {
		 *         8   : 'backspace',
		 *         9   : 'tab',
		 *         13  : 'enter!',
		 *         27  : 'escape!',
		 *         37  : 'left',
		 *         38  : 'up!',
		 *         39  : 'right',
		 *         40  : 'down!',
		 *         46  : 'delete',
		 *         108 : 'numpadEnter'
		 *     }
		 *
		 * Please note the `!` at the end of some keys. This tells the core that by default
		 * this keypress will be trapped and not passed on to the text input.
		 *
		 * @name keys
		 * @default { ... }
		 * @author agorbatchev
		 * @date 2011/08/19
		 * @id TextExt.options.keys
		 */
		OPT_KEYS = 'keys',

		/**
		 * The core triggers or reacts to the following events.
		 *
		 * @author agorbatchev
		 * @date 2011/08/17
		 * @id TextExt.events
		 */

		/**
		 * Core triggers `preInvalidate` event before the dimensions of padding on the text input
		 * are set.
		 *
		 * @name preInvalidate
		 * @author agorbatchev
		 * @date 2011/08/19
		 * @id TextExt.events.preInvalidate
		 */
		EVENT_PRE_INVALIDATE = 'preInvalidate',

		/**
		 * Core triggers `postInvalidate` event after the dimensions of padding on the text input
		 * are set.
		 *
		 * @name postInvalidate
		 * @author agorbatchev
		 * @date 2011/08/19
		 * @id TextExt.events.postInvalidate
		 */
		EVENT_POST_INVALIDATE = 'postInvalidate',
		
		/**
		 * Core triggers `postInit` event to let plugins run code after all plugins have been 
		 * created and initialized. This is a good place to set some kind of global values before 
		 * somebody gets to use them. This is not the right place to expect all plugins to finish
		 * their initialization.
		 *
		 * @name postInit
		 * @author agorbatchev
		 * @date 2011/08/19
		 * @id TextExt.events.postInit
		 */
		EVENT_POST_INIT = 'postInit',

		/**
		 * Core triggers `ready` event after all global configuration and prepearation has been
		 * done and the TextExt component is ready for use. Event handlers should expect all 
		 * values to be set and the plugins to be in the final state.
		 *
		 * @name ready
		 * @author agorbatchev
		 * @date 2011/08/19
		 * @id TextExt.events.ready
		 */
		EVENT_READY = 'ready',

		EVENT_INPUT_DATA_CHANGE = 'inputDataChange',
		EVENT_FORM_DATA_CHANGE = 'formDataChange',

		/**
		 * Core triggers `anyKeyUp` event for every key up event triggered within the component.
		 *
		 * @name anyKeyUp
		 * @author agorbatchev
		 * @date 2011/08/19
		 * @id TextExt.events.anyKeyUp
		 */

		/**
		 * Core triggers `anyKeyDown` event for every key down event triggered within the component.
		 *
		 * @name anyKeyDown
		 * @author agorbatchev
		 * @date 2011/08/19
		 * @id TextExt.events.anyKeyDown
		 */

		/**
		 * Core triggers `[name]KeyUp` event for every key specifid in the `keys` option that is 
		 * triggered within the component.
		 *
		 * @name [name]KeyUp
		 * @author agorbatchev
		 * @date 2011/08/19
		 * @id TextExt.events.[name]KeyUp
		 */

		/**
		 * Core triggers `[name]KeyDown` event for every key specified in the `keys` option that is 
		 * triggered within the component.
		 *
		 * @name [name]KeyDown
		 * @author agorbatchev
		 * @date 2011/08/19
		 * @id TextExt.events.[name]KeyDown
		 */

		/**
		 * Core triggers `[name]KeyPress` event for every key specified in the `keys` option that is 
		 * triggered within the component.
		 *
		 * @name [name]KeyPress
		 * @author agorbatchev
		 * @date 2011/08/19
		 * @id TextExt.events.[name]KeyPress
		 */

		DEFAULT_OPTS = {
			itemManager : null,
			plugins     : [],
			dataSource  : null,
			ext         : {},

			html : {
				wrap   : '<div class="text-core"><div class="text-wrap"/></div>',
				hidden : '<input type="hidden" />'
			},

			keys : {
				8   : 'backspace',
				9   : 'tab',
				13  : 'enter!',
				27  : 'escape!',
				37  : 'left',
				38  : 'up!',
				39  : 'right',
				40  : 'down!',
				46  : 'delete',
				108 : 'numpadEnter'
			}
		}
		;

	/**
	 * Returns object property by name where name is dot-separated and object is multiple levels deep.
	 * @param target Object Source object.
	 * @param name String Dot separated property name, ie `foo.bar.world`
	 * @id core.getProperty
	 */
	function getProperty(source, name)
	{
		if(typeof(name) === 'string')
			name = name.split('.');

		var fullCamelCaseName = name.join('.').replace(/\.(\w)/g, function(match, letter) { return letter.toUpperCase() }),
			nestedName        = name.shift(),
			result
			;

		if(typeof(result = source[fullCamelCaseName]) != UNDEFINED)
			result = result;

		else if(typeof(result = source[nestedName]) != UNDEFINED && name.length > 0)
			result = getProperty(result, name);

		// name.length here should be zero
		return result;
	};

	/**
	 * Hooks up specified events in the scope of the current object.
	 * @author agorbatchev
	 * @date 2011/08/09
	 */
	function hookupEvents()
	{
		var args   = slice.apply(arguments),
			self   = this,
			target = args.length === 1 ? self : args.shift(),
			event
			;

		args = args[0] || {};

		function bind(event, handler)
		{
			target.bind(event, function()
			{
				// apply handler to our PLUGIN object, not the target
				return handler.apply(self, arguments);
			});
		}

		for(event in args)
			bind(event, args[event]);
	};

	//--------------------------------------------------------------------------------
	// TextExt core component

	p = TextExt.prototype;
		
	/**
	 * Initializes current component instance with work with the supplied text input and options.
	 *
	 * @signature TextExt.init(input, opts)
	 *
	 * @param input {HTMLElement} Text input.
	 * @param opts {Object} Options.
	 *
	 * @author agorbatchev
	 * @date 2011/08/19
	 * @id TextExt.init
	 */
	p.init = function(input, opts)
	{
		var self = this,
			hiddenInput,
			itemManager,
			container
			;

		self._defaults    = $.extend({}, DEFAULT_OPTS);
		self._opts        = opts || {};
		self._plugins     = {};
		self._dataSource  = self.opts(OPT_DATA_SOURCE);
		input             = $(input);
		container         = $(self.opts(OPT_HTML_WRAP));
		hiddenInput       = $(self.opts(OPT_HTML_HIDDEN));
		itemManager       = self.opts(OPT_ITEM_MANAGER) || 'default';

		if(typeof(itemManager) === 'string')
			itemManager = textext.itemManagers[itemManager];

		itemManager = self._itemManager = new itemManager();

		input
			.wrap(container)
			.keydown(function(e) { return self.onKeyDown(e) })
			.keyup(function(e) { return self.onKeyUp(e) })
			.data('textext', self)
			;

		// keep references to html elements using jQuery.data() to avoid circular references
		$(self).data({
			'hiddenInput' : hiddenInput,
			'wrapElement' : input.parents('.text-wrap').first(),
			'input'       : input
		});

		// set the name of the hidden input to the text input's name
		hiddenInput.attr('name', input.attr('name'));
		// remove name attribute from the text input
		input.attr('name', null);
		// add hidden input to the DOM
		hiddenInput.insertAfter(input);

		$.extend(true, itemManager, self.opts(OPT_EXT + '.item.manager'));
		$.extend(true, self, self.opts(OPT_EXT + '.*'), self.opts(OPT_EXT + '.core'));
		
		self.originalWidth = input.outerWidth();

		self.invalidateBounds();

		self.initPatches();
		self.initPlugins(self.opts(OPT_PLUGINS), $.fn.textext.plugins);

		self.on({
			anyKeyUp : self.onAnyKeyUp
		});

		setTimeout(function()
		{
			self.trigger(EVENT_POST_INIT);
			self.trigger(EVENT_READY);
			self.invalidateData();
		}, 1);

		itemManager.init(self);
	};

	/**
	 * Initialized all installed patches against current instance. The patches are initialized based on their
	 * initialization priority which is returned by each patch's `initPriority()` method. Priority
	 * is a `Number` where patches with higher value gets their `init()` method called before patches
	 * with lower priority value.
	 *
	 * This facilitates initializing of patches in certain order to insure proper dependencies
	 * regardless of which order they are loaded.
	 *
	 * By default all patches have the same priority - zero, which means they will be initialized
	 * in rorder they are loaded, that is unless `initPriority()` is overriden.
	 *
	 * @signature TextExt.initPatches()
	 *
	 * @author agorbatchev
	 * @date 2011/10/11
	 * @id TextExt.initPatches
	 */
	p.initPatches = function()
	{
		var list   = [],
			source = $.fn.textext.patches,
			name
			;

		for(name in source)
			list.push(name);

		this.initPlugins(list, source);
	};

	/**
	 * Creates and initializes all specified plugins. The plugins are initialized based on their
	 * initialization priority which is returned by each plugin's `initPriority()` method. Priority
	 * is a `Number` where plugins with higher value gets their `init()` method called before plugins
	 * with lower priority value.
	 *
	 * This facilitates initializing of plugins in certain order to insure proper dependencies
	 * regardless of which order user enters them in the `plugins` option field.
	 *
	 * By default all plugins have the same priority - zero, which means they will be initialized
	 * in the same order as entered by the user.
	 *
	 * @signature TextExt.initPlugins(plugins)
	 *
	 * @param plugins {Array} List of plugin names to initialize.
	 *
	 * @author agorbatchev
	 * @date 2011/08/19
	 * @id TextExt.initPlugins
	 */
	p.initPlugins = function(plugins, source)
	{
		var self     = this,
			initList = [],
			ext, 
			name, 
			plugin, 
			i
			;

		if(typeof(plugins) === 'string')
			plugins = plugins.split(/\s*[,>]\s*|\s+/g);

		function createGetter(name, plugin)
		{
			self[name] = function()
			{
				return plugin;
			};
		}

		for(i = 0; i < plugins.length; i++)
		{
			name = plugins[i];

			if(name.charAt(name.length - 1) === '*')
				self._dataSource = name = name.substr(0, name.length - 1);

			plugin = source[name];

			if(plugin)
			{
				self._plugins[name] = plugin = new plugin();

				initList.push(plugin);
				$.extend(true, plugin, self.opts(OPT_EXT + '.*'), self.opts(OPT_EXT + '.' + name));

				// Create a function on the current instance to get this plugin instance
				// For example for `autocomplete` plugin we will have `textext.autocomplete()`
				// function returning this isntance.
				createGetter(name, plugin);
			}
			else
			{
				throw new Error('TextExt.js: unknown plugin: ' + name);
			}
		}

		// sort plugins based on their priority values
		initList.sort(function(p1, p2)
		{
			p1 = p1.initPriority();
			p2 = p2.initPriority();

			return p1 === p2
				? 0
				: p1 < p2 ? 1 : -1
				;
		});

		for(i = 0; i < initList.length; i++)
		{
			plugin = initList[i];

			if(!self._dataSource && plugin.getFormData)
				self._dataSource = plugin;

			plugin.init(self);
		}
	};

	/**
	 * Returns true if specified plugin is was instantiated for the current instance of core.
	 *
	 * @signature TextExt.hasPlugin(name)
	 *
	 * @param name {String} Name of the plugin to check.
	 *
	 * @author agorbatchev
	 * @date 2011/12/28
	 * @id TextExt.hasPlugin
	 * @version 1.1
	 */
	p.hasPlugin = function(name)
	{
		return !!this._plugins[name];
	};

	/**
	 * Allows to add multiple event handlers which will be execued in the scope of the current object.
	 * 
	 * @signature TextExt.on([target], handlers)
	 *
	 * @param target {Object} **Optional**. Target object which has traditional `bind(event, handler)` method.
	 *                        Handler function will still be executed in the current object's scope.
	 * @param handlers {Object} Key/value pairs of event names and handlers, eg `{ event: handler }`.
	 *
	 * @author agorbatchev
	 * @date 2011/08/19
	 * @id TextExt.on
	 */
	p.on = hookupEvents;

	/**
	 * Binds an event handler to the input box that user interacts with.
	 *
	 * @signature TextExt.bind(event, handler)
	 *
	 * @param event {String} Event name.
	 * @param handler {Function} Event handler.
	 *
	 * @author agorbatchev
	 * @date 2011/08/19
	 * @id TextExt.bind
	 */
	p.bind = function(event, handler)
	{
		this.input().bind(event, handler);
	};

	/**
	 * Triggers an event on the input box that user interacts with. All core events are originated here.
	 * 
	 * @signature TextExt.trigger(event, ...args)
	 *
	 * @param event {String} Name of the event to trigger.
	 * @param ...args All remaining arguments will be passed to the event handler.
	 *
	 * @author agorbatchev
	 * @date 2011/08/19
	 * @id TextExt.trigger
	 */
	p.trigger = function()
	{
		var args = arguments;
		this.input().trigger(args[0], slice.call(args, 1));
	};

	/**
	 * Returns instance of `itemManager` that is used by the component.
	 *
	 * @signature TextExt.itemManager()
	 *
	 * @author agorbatchev
	 * @date 2011/08/19
	 * @id TextExt.itemManager
	 */
	p.itemManager = function()
	{
		return this._itemManager;
	};

	/**
	 * Returns jQuery input element with which user is interacting with.
	 *
	 * @signature TextExt.input()
	 *
	 * @author agorbatchev
	 * @date 2011/08/10
	 * @id TextExt.input
	 */
	p.input = function()
	{
		return $(this).data('input');
	};

	/**
	 * Returns option value for the specified option by name. If the value isn't found in the user
	 * provided options, it will try looking for default value.
	 *
	 * @signature TextExt.opts(name)
	 *
	 * @param name {String} Option name as described in the options.
	 *
	 * @author agorbatchev
	 * @date 2011/08/19
	 * @id TextExt.opts
	 */
	p.opts = function(name)
	{
		var result = getProperty(this._opts, name);
		return typeof(result) == 'undefined' ? getProperty(this._defaults, name) : result;
	};

	/**
	 * Returns HTML element that was created from the `html.wrap` option. This is the top level HTML
	 * container for the text input with which user is interacting with.
	 *
	 * @signature TextExt.wrapElement()
	 *
	 * @author agorbatchev
	 * @date 2011/08/19
	 * @id TextExt.wrapElement
	 */
	p.wrapElement = function()
	{
		return $(this).data('wrapElement');
	};

	/**
	 * Updates container to match dimensions of the text input. Triggers `preInvalidate` and `postInvalidate`
	 * events.
	 *
	 * @signature TextExt.invalidateBounds()
	 *
	 * @author agorbatchev
	 * @date 2011/08/19
	 * @id TextExt.invalidateBounds
	 */
	p.invalidateBounds = function()
	{
		var self      = this,
			input     = self.input(),
			wrap      = self.wrapElement(),
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

	/**
	 * Focuses user input on the text box.
	 *
	 * @signature TextExt.focusInput()
	 *
	 * @author agorbatchev
	 * @date 2011/08/19
	 * @id TextExt.focusInput
	 */
	p.focusInput = function()
	{
		this.input()[0].focus();
	};

	/**
	 * Returns the hidden input HTML element which will be submitted with the HTML form.
	 *
	 * @signature TextExt.hiddenInput()
	 *
	 * @author agorbatchev
	 * @date 2011/08/09
	 * @id TextExt.hiddenInput
	 */
	p.hiddenInput = function(value)
	{
		return $(this).data('hiddenInput');
	};

	/**
	 * Triggers the `getFormData` event to get all the plugins to return their data.
	 *
	 * After the data is returned, triggers `setFormData` and `setInputData` to update appopriate values.
	 *
	 * @signature TextExt.invalidateData(keyCode)
	 *
	 * @param keyCode {Number} Key code number which has triggered this update. It's impotant to pass
	 * this value to the plugins because they might return different values based on the key that was 
	 * pressed. For example, the Tags plugin returns an empty string for the `input` value if the enter
	 * key was pressed, otherwise it returns whatever is currently in the text input.
	 *
	 * @author agorbatchev
	 * @date 2011/08/22
	 * @id TextExt.invalidateData
	 */
	p.invalidateData = function(keyCode)
	{
		var self       = this,
			dataSource = self._dataSource,
			plugin     = dataSource
			;
		
		function error(msg)
		{
			throw new Error('TextExt.js: ' + msg);
		}

		if(!dataSource)
			error('no `dataSource` set and no plugin supports `getFormData`');

		if(typeof(dataSource) === 'string')
		{
			plugin = self._plugins[dataSource];
			
			if(!plugin)
				error('`dataSource` plugin not found: ' + dataSource);
		}

		if(plugin.getFormData)
			// need to insure `dataSource` below is executing with plugin as plugin scop and
			// if we just reference the `getFormData` function it will be in the window scope.
			dataSource = function()
			{
				plugin.getFormData.apply(plugin, arguments);
			};

		if(!dataSource)
			error('specified `dataSource` plugin does not have `getFormData` function: ' + dataSource);

		dataSource(keyCode, function(err, form, input)
		{
			self.setInputData(input);
			self.setFormData(form);
		});
	};

	//--------------------------------------------------------------------------------
	// Event handlers

	/**
	 * Reacts to the `anyKeyUp` event and triggers the `getFormData` to change data that will be submitted
	 * with the form. Default behaviour is that everything that is typed in will be JSON serialized, so
	 * the end result will be a JSON string.
	 *
	 * @signature TextExt.onAnyKeyUp(e)
	 *
	 * @param e {Object} jQuery event.
	 *
	 * @author agorbatchev
	 * @date 2011/08/19
	 * @id TextExt.onAnyKeyUp
	 */
	p.onAnyKeyUp = function(e, keyCode)
	{
		this.invalidateData(keyCode);
	};

	/**
	 * Reacts to the `setInputData` event and populates the input text field that user is currently
	 * interacting with.
	 *
	 * @signature TextExt.onSetInputData(e, data)
	 *
	 * @param e {Event} jQuery event.
	 * @param data {String} Value to be set.
	 *
	 * @author agorbatchev
	 * @date 2011/08/22
	 * @id TextExt.onSetInputData
	 */
	p.setInputData = function(data)
	{
		var self  = this,
			input = this.input()
			;

		if(input.val() != data)
		{
			input.val(data);
			self.trigger(EVENT_INPUT_DATA_CHANGE, data);
		}
	};

	/**
	 * Reacts to the `setFormData` event and populates the hidden input with will be submitted with
	 * the HTML form. The value will be serialized with `serializeData()` method.
	 *
	 * @signature TextExt.onSetFormData(e, data)
	 *
	 * @param e {Event} jQuery event.
	 * @param data {Object} Data that will be set.
	 * 
	 * @author agorbatchev
	 * @date 2011/08/22
	 * @id TextExt.onSetFormData
	 */
	p.setFormData = function(data)
	{
		var self  = this,
			input = this.hiddenInput()
			;

		if(input.val() != data)
		{
			input.val(data);
			self.trigger(EVENT_FORM_DATA_CHANGE, data);
		}
	};

	//--------------------------------------------------------------------------------
	// User mouse/keyboard input

	/**
	 * Triggers `[name]KeyUp` and `[name]KeyPress` for every keystroke as described in the events.
	 *
	 * @signature TextExt.onKeyUp(e)
	 *
	 * @param e {Object} jQuery event.
	 * @author agorbatchev
	 * @date 2011/08/19
	 * @id TextExt.onKeyUp
	 */

	/**
	 * Triggers `[name]KeyDown` for every keystroke as described in the events.
	 *
	 * @signature TextExt.onKeyDown(e)
	 *
	 * @param e {Object} jQuery event.
	 * @author agorbatchev
	 * @date 2011/08/19
	 * @id TextExt.onKeyDown
	 */
	
	$(['Down', 'Up']).each(function()
	{
		var type = this.toString();

		p['onKey' + type] = function(e)
		{
			var self          = this,
				keyName       = self.opts(OPT_KEYS)[e.keyCode],
				defaultResult = true
				;

			if(keyName)
			{
				defaultResult = keyName.substr(-1) != '!';
				keyName       = keyName.replace('!', '');

				self.trigger(keyName + 'Key' + type);

				// manual *KeyPress event fimplementation for the function keys like Enter, Backspace, etc.
				if(type == 'Up' && self._lastKeyDown == e.keyCode)
				{
					self._lastKeyDown = null;
					self.trigger(keyName + 'KeyPress');
				}

				if(type == 'Down')
					self._lastKeyDown = e.keyCode;
			}

			self.trigger('anyKey' + type, e.keyCode);

			return defaultResult;
		};
	});

	//--------------------------------------------------------------------------------
	// jQuery Integration
	
	/**
	 * TextExt integrates as a jQuery plugin available through the `$(selector).textext(opts)` call. If
	 * `opts` argument is passed, then a new instance of `TextExt` will be created for all the inputs
	 * that match the `selector`. If `opts` wasn't passed and TextExt was already intantiated for 
	 * inputs that match the `selector`, array of `TextExt` instances will be returned instead.
	 *
	 *     // will create a new instance of `TextExt` for all elements that match `.sample`
	 *     $('.sample').textext({ ... });
	 *
	 *     // will return array of all `TextExt` instances
	 *     var list = $('.sample').textext();
	 *
	 * The following properties are also exposed through the jQuery `$.fn.textext`:
	 *
	 * * `TextExt` -- `TextExt` class.
	 * * `TextExtPlugin` -- `TextExtPlugin` class.
	 * * `ItemManager` -- `ItemManager` class.
	 * * `plugins` -- Key/value table of all registered plugins.
	 * * `addPlugin(name, constructor)` -- All plugins should register themselves using this function.
	 *
	 * @author agorbatchev
	 * @date 2011/08/19
	 * @id TextExt.jquery
	 */

	var cssInjected = false;

	var textext = $.fn.textext = function(opts)
	{
		var css;
		
		if(!cssInjected && (css = $.fn.textext.css) != null)
		{
			$('head').append('<style>' + css + '</style>');
			cssInjected = true;
		}

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

	/**
	 * This static function registers a new plugin which makes it available through the `plugins` option
	 * to the end user. The name specified here is the name the end user would put in the `plugins` option
	 * to add this plugin to a new instance of TextExt.
	 * 
	 * @signature $.fn.textext.addPlugin(name, constructor)
	 *
	 * @param name {String} Name of the plugin.
	 * @param constructor {Function} Plugin constructor.
	 *
	 * @author agorbatchev
	 * @date 2011/10/11
	 * @id TextExt.addPlugin
	 */
	textext.addPlugin = function(name, constructor)
	{
		textext.plugins[name] = constructor;
		constructor.prototype = new textext.TextExtPlugin();
	};

	/**
	 * This static function registers a new patch which is added to each instance of TextExt. If you are
	 * adding a new patch, make sure to call this method.
	 * 
	 * @signature $.fn.textext.addPatch(name, constructor)
	 *
	 * @param name {String} Name of the patch.
	 * @param constructor {Function} Patch constructor.
	 *
	 * @author agorbatchev
	 * @date 2011/10/11
	 * @id TextExt.addPatch
	 */
	textext.addPatch = function(name, constructor)
	{
		textext.patches[name] = constructor;
		constructor.prototype = new textext.TextExtPlugin();
	};

	textext.addItemManager = function(name, constructor)
	{
		textext.itemManagers[name] = constructor;
		constructor.prototype      = new textext.ItemManager();
	};

	textext.TextExt      = TextExt;
	textext.plugins      = {};
	textext.patches      = {};
	textext.itemManagers = {};
})(jQuery);

