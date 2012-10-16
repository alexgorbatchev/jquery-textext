/**
 * jQuery TextExt Plugin
 * http://textextjs.com
 *
 * @version 1.3.0
 * @copyright Copyright (C) 2011-2012 Alex Gorbatchev. All rights reserved.
 * @license MIT License
 */
(function($, undefined)
{
	/**
	 * Plugin is a base class for all plugins. It provides common methods which are reused
	 * by majority of plugins.
	 *
	 * All plugins must register themselves by calling the `$.fn.textext.addPlugin(name, constructor)`
	 * function while providing plugin name and constructor. The plugin name is the same name that user
	 * will identify the plugin in the `plugins` option when initializing TextExt component and constructor
	 * function will create a new instance of the plugin. *Without registering, the core won't
	 * be able to see the plugin.*
	 *
	 * <span class="new label version">new in 1.2.0</span> You can get instance of each plugin from the core 
	 * via associated function with the same name as the plugin. For example:
	 *
	 *     $('#input').textext()[0].tags()
	 *     $('#input').textext()[0].autocomplete()
	 *     ...
	 *
	 * @author agorbatchev
	 * @date 2011/08/19
	 * @id Plugin
	 */
	function Plugin() {};
	
	var textext = $.fn.textext,
		p       = Plugin.prototype
		;

	textext.Plugin = Plugin;

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
	 * @id on
	 */
	p.on = textext.TextExt.prototype.on;

	/**
	 * Initialization method called by the core during plugin instantiation. This method must be implemented
	 * by each plugin individually.
	 *
	 * @signature Plugin.init(core)
	 *
	 * @param core {TextExt} Instance of the TextExt core class.
	 *
	 * @author agorbatchev
	 * @date 2011/08/19
	 * @id init
	 */
	p.init = function(core)
	{
		throw new Error('Plugin must implement init() method');
	};

	/**
	 * Initialization method wich should be called by the plugin during the `init()` call.
	 *
	 * @signature Plugin.baseInit(core, defaults)
	 *
	 * @param core {TextExt} Instance of the TextExt core class.
	 * @param defaults {Object} Default plugin options. These will be checked if desired value wasn't
	 * found in the options supplied by the user.
	 *
	 * @author agorbatchev
	 * @date 2011/08/19
	 * @id baseInit
	 */
	p.baseInit = function(core, defaults)
	{
		var self = this;

		self._core          = core;
		core.defaultOptions = $.extend(true, core.defaultOptions, defaults);
		self.timers         = {};
	};

	/**
	 * Allows starting of multiple timeout calls. Each time this method is called with the same
	 * timer name, the timer is reset. This functionality is useful in cases where an action needs
	 * to occur only after a certain period of inactivity. For example, making an AJAX call after 
	 * user stoped typing for 1 second.
	 *
	 * @signature Plugin.startTimer(name, delay, callback)
	 *
	 * @param name {String} Timer name.
	 * @param delay {Number} Delay in seconds.
	 * @param callback {Function} Callback function.
	 *
	 * @author agorbatchev
	 * @date 2011/08/25
	 * @id startTimer
	 */
	p.startTimer = function(name, delay, callback)
	{
		var self = this;

		self.stopTimer(name);

		self.timers[name] = setTimeout(
			function()
			{
				delete self.timers[name];
				callback.apply(self);
			},
			delay * 1000
		);
	};

	/**
	 * Stops the timer by name without resetting it.
	 *
	 * @signature Plugin.stopTimer(name)
	 *
	 * @param name {String} Timer name.
	 *
	 * @author agorbatchev
	 * @date 2011/08/25
	 * @id stopTimer
	 */
	p.stopTimer = function(name)
	{
		clearTimeout(this.timers[name]);
	};

	/**
	 * Returns instance of the `TextExt` to which current instance of the plugin is attached to.
	 *
	 * @signature Plugin.core()
	 *
	 * @author agorbatchev
	 * @date 2011/08/19
	 * @id core
	 */
	p.core = function()
	{
		return this._core;
	};

	/**
	 * Shortcut to the core's `opts()` method. Returns option value.
	 *
	 * @signature Plugin.opts(name)
	 * 
	 * @param name {String} Option name as described in the options.
	 *
	 * @author agorbatchev
	 * @date 2011/08/19
	 * @id opts
	 */
	p.opts = function(name)
	{
		return this.core().opts(name);
	};

	/**
	 * Shortcut to the core's `itemManager()` method. Returns instance of the `ItemManger` that is
	 * currently in use.
	 *
	 * @signature Plugin.itemManager()
	 *
	 * @author agorbatchev
	 * @date 2011/08/19
	 * @id itemManager
	 */
	p.itemManager = function()
	{
		return this.core().itemManager();
	};

	p.itemValidator = function()
	{
		return this.core().itemValidator();
	};

	/**
	 * Shortcut to the core's `input()` method. Returns instance of the HTML element that represents
	 * current text input.
	 *
	 * @signature Plugin.input()
	 *
	 * @author agorbatchev
	 * @date 2011/08/19
	 * @id input
	 */
	p.input = function()
	{
		return this.core().input();
	};

	/**
	 * Shortcut to the commonly used `this.input().val()` call to get or set value of the text input.
	 *
	 * @signature Plugin.val(value)
	 *
	 * @param value {String} Optional value. If specified, the value will be set, otherwise it will be
	 * returned.
	 *
	 * @author agorbatchev
	 * @date 2011/08/20
	 * @id val
	 */
	p.val = function(value)
	{
		var input = this.input();

		if(typeof(value) === 'undefined')
			return input.val();
		else
			input.val(value);
	};

	/**
	 * Shortcut to the core's `trigger()` method. Triggers specified event with arguments on the
	 * component core.
	 *
	 * @signature Plugin.trigger(event, ...args)
	 *
	 * @param event {String} Name of the event to trigger.
	 * @param ...args All remaining arguments will be passed to the event handler.
	 *
	 * @author agorbatchev
	 * @date 2011/08/19
	 * @id trigger
	 */
	p.trigger = function()
	{
		var core = this.core();
		core.trigger.apply(core, arguments);
	};

	/**
	 * Shortcut to the core's `bind()` method. Binds specified handler to the event.
	 *
	 * @signature Plugin.bind(event, handler)
	 *
	 * @param event {String} Event name.
	 * @param handler {Function} Event handler.
	 *
	 * @author agorbatchev
	 * @date 2011/08/20
	 * @id bind
	 */
	p.bind = function(event, handler)
	{
		this.core().bind(event, handler);
	};
})(jQuery);

