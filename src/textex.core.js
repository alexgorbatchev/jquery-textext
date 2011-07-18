(function($)
{
	function TextEx()
	{
	};

	var p = TextEx.prototype,
		DEFAULT_OPTS = {
			plugins : [],
			ex : {},

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

	p.init = function(input, opts)
	{
		var self = this;

		self.opts = opts = $.extend(true, {}, DEFAULT_OPTS, opts || {});

		self.input = input = $(input)
			.wrap(opts.html.wrap)
			.keydown(function(e) { return self.onKeyDown(e) })
			.keyup(function(e) { return self.onKeyUp(e) })
			.blur(function(e) { return self.onBlur(e) })
			;

		self.initPlugins(opts.plugins);

		// after the plugins, grab extensions from the user which will override everything
		$.extend(true, self, opts.ex);

		self.getWrapContainer().click(function(e) { return self.onClick(e) });

		self.originalWidth = input.outerWidth();
		self.invalidateBounds();
	};

	p.initPlugins = function(plugins)
	{
		var self = this,
			plugin
			;

		for(var i = 0; i < plugins.length; i++)
		{
			plugin = $.fn.textex.plugins[plugins[i]];

			if(plugin)
			{
				plugin = new plugin();
				plugin.init(self);
			}
		}
	};

	p.trigger = function()
	{
		var self = $(this);
		self.trigger.apply(self, arguments);
	};

	p.getInput = function()
	{
		return this.input;
	};

	p.getOpts = function()
	{
		return this.opts;
	};

	p.getWrapContainer = function()
	{
		return this.getInput().parent();
	};

	p.invalidateBounds = function()
	{
		var self      = this,
			input     = self.getInput(),
			wrap      = self.getWrapContainer(),
			container = wrap.parent(),
			width     = self.originalWidth,
			height
			;

		self.trigger('invalidate');

		height = input.outerHeight()

		input.width(width);
		wrap.width(width).height(height);
		container.height(height);
	};

	p.focusInput = function()
	{
		this.getInput()[0].focus();
	};

	//--------------------------------------------------------------------------------
	// User mouse/keyboard input
	
	p.onBlur = function(e)
	{
		this.trigger('blur');
	};

	p.onClick = function(e)
	{
		var self   = this,
			source = $(e.target)
			;

		self.trigger('click', [ source ]);

		return true;
	};

	$(['Down', 'Up']).each(function()
	{
		var type = this.toString();

		p['onKey' + type] = function(e)
		{
			var self          = this,
				keyName       = self.getOpts().keys[e.keyCode] || 'Other',
				defaultResult = keyName.indexOf('!') != keyName.length - 1,
				eventName     = keyName.replace('!', '') + 'Key' + type,
				handler       = self['on' + eventName],
				result
				;

			self.trigger(eventName.charAt(0).toLowerCase() + eventName.substring(1));

			if($.isFunction(handler))
			{
				result = handler.call(self, e);
				return typeof(result) == 'undefined' ? defaultResult : result;
			}

			return defaultResult;
		};
	});

	//--------------------------------------------------------------------------------
	// Plugin Base
	
	function TextExPlugin()
	{
	};

	p = TextExPlugin.prototype;

	p.on = function(args)
	{
		var self   = this,
			parent = $(self.getParent()),
			event
			;

		for(event in args)
			(function(self, event, handler)
			{

				parent.bind(event, function()
				{
					return handler.apply(self, arguments);
				});

			})(self, event, args[event]);
	};

	p.baseInit = function(parent, opts)
	{
		parent.opts = $.extend(true, {}, opts, parent.opts);
		p.parent = parent;
	};

	p.getParent = function()
	{
		return this.parent;
	};

	p.getOpts = function()
	{
		return this.getParent().getOpts();
	};

	p.getInput = function()
	{
		return this.getParent().getInput();
	};

	//--------------------------------------------------------------------------------
	// jQuery Integration
	
	var textex = $.fn.textex = function(opts)
	{
		return this.each(function()
		{
			 new TextEx().init(this, opts);
		});
	};

	textex.addPlugin = function(name, constructor)
	{
		textex.plugins[name]  = constructor;
		constructor.prototype = new textex.TextExPlugin();
	};

	textex.TextEx       = TextEx;
	textex.TextExPlugin = TextExPlugin;
	textex.plugins      = {};
})(jQuery);
