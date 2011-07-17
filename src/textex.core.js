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
				wrap : '<div class="textex"><div class="wrap"/></div>'
			},

			keys : {
				8   : 'Backspace',
				9   : 'Tab',
				13  : 'Enter',
				27  : 'Escape',
				37  : 'Left',
				38  : 'Up',
				39  : 'Right',
				40  : 'Down',
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
		self.originalPadding = { 
			left : parseInt(input.css('paddingLeft') || 0),
			top  : parseInt(input.css('paddingTop') || 0)
		};

		self.invalidateInputBox();
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

	p.invalidateInputBox = function()
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
		var self = this;
		self.trigger('blur');
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
			var self    = this,
				handler = self['on' + self.getOpts().keys[e.keyCode] + 'Key' + type],
				result
				;

			if($.isFunction(handler))
			{
				result = handler.call(self, e);
				return typeof(result) == 'undefined' ? true : result;
			}
			else
			{
				return self['onOtherKey' + type](e);
			}
		};
	});

	p.onOtherKeyUp = function(e)
	{
		this.trigger('otherKeyUp');
		return true;
	};

	p.onOtherKeyDown = function(e)
	{
		this.trigger('otherKeyDown');
		return true;
	};

	p.onDownKeyDown = function(e)
	{
		this.trigger('downKeyDown');
		return false;
	};

	p.onUpKeyDown = function(e)
	{
		this.trigger('upKeyDown');
		return false;
	};

	p.onEnterKeyDown = function(e)
	{
		var self = this;
		this.trigger('enterKeyDown');
		return false;
	};

	p.onEnterKeyUp = function(e)
	{
		this.trigger('enterKeyUp');
		return false;
	};

	p.onEscapeKeyUp = function(e)
	{
		var self = this;
		this.trigger('escapeKeyUp');
		return false;
	};

	//--------------------------------------------------------------------------------
	// jQuery Integration
	
	$.fn.textex = function(opts)
	{
		return this.each(function()
		{
			 new TextEx().init(this, opts);
		});
	};

	$.fn.textex.prototype = p;
	$.fn.textex.plugins   = {};
})(jQuery);
