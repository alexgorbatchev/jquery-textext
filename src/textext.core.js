(function($)
{
	function TextExt()
	{
	};

	var p = TextExt.prototype,
		DEFAULT_OPTS = {
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

		$.extend(true, self, opts.ext['*'], opts.ext['core']);
		
		self.getWrapContainer().click(function(e) { return self.onClick(e) });

		self.originalWidth = input.outerWidth();

		self.invalidateBounds();
		self.initPlugins(opts.plugins);
	};

	p.initPlugins = function(plugins)
	{
		var self = this,
			ext = self.getOpts().ext,
			plugin
			;

		if(typeof(plugins) == 'string')
			plugins = plugins.split(/\s*,\s*/g);

		for(var i = 0; i < plugins.length; i++)
		{
			plugin = $.fn.textext.plugins[plugins[i]];

			if(plugin)
			{
				plugin = new plugin();
				$.extend(true, plugin, ext['*'], ext[plugins[i]]);
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
	
	function TextExtPlugin()
	{
	};

	p = TextExtPlugin.prototype;

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
	
	var textext = $.fn.textext = function(opts)
	{
		return this.map(function()
		{
			 var instance = new TextExt();
			 instance.init(this, opts);
			 return instance;
		});
	};

	textext.addPlugin = function(name, constructor)
	{
		textext.plugins[name]  = constructor;
		constructor.prototype = new textext.TextExtPlugin();
	};

	textext.TextExt       = TextExt;
	textext.TextExtPlugin = TextExtPlugin;
	textext.plugins      = {};
})(jQuery);
