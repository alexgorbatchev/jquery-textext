(function($)
{
	function AutoSuggest()
	{
	};

	var p = AutoSuggest.prototype,
		DEFAULT_OPTS = {
			tagsEnabled : true,
			html : {
				wrap : '<div class="autosuggest"><div class="wrap"/></div>',
				tags : '<div class="tags"/>',
				tag : '<div class="tag"><button><span class="label"/><a/></button></div>'
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

		input = self.$input = $(input);
		input
			.wrap(opts.html.wrap)
			.after(opts.html.tags)
			.keydown(function(e) { return self.onKeyDown(e); })
			;

		self.getTagsContainer().click(function() { input[0].focus(); });

		self.inputPaddingLeft = parseInt(input.css('paddingLeft') || 0);
		self.inputPaddingTop = parseInt(input.css('paddingTop') || 0);
		self.inputWidth = input.outerWidth();
		self.inputHeight = input.outerHeight();
		self.updateBox();
	};

	p.getInput = function()
	{
		return this.$input;
	};

	p.getTagsContainer = function()
	{
		return this.getInput().next();
	};

	p.updateBox = function()
	{
		var self      = this,
			input     = self.getInput(),
			wrap      = input.parent(),
			container = wrap.parent(),
			width     = self.inputWidth,
			lastTag   = self.getTagElements().last(),
			pos       = lastTag.position(),
			height
			;
		
		if(lastTag.length > 0)
			input.css({
				paddingLeft : pos.left + lastTag.innerWidth(),
				paddingTop  : pos.top
			});

		height = input.outerHeight()

		input.width(width);
		wrap.width(width).height(height);
		container.height(height);
	};

	p.onKeyDown = function(e)
	{
		var self    = this,
			handler = self['onKey' + self.opts.keys[e.keyCode]],
			result
			;

		if(handler)
		{
			result = handler.call(self, e);
			return typeof(result) == 'undefined' ? true : result;
		}
		else
		{
			return self.onKeyInput(e);
		}
	};

	p.onKeyInput = function(e)
	{
		return true;
	};

	p.onKeyEnter = function(e)
	{
		var self = this;

		if(self.opts.tagsEnabled)
			self.grabTagFromInput(self.$input);

		return false;
	};

	p.stringToTag = function(str)
	{
		return str;
	};

	p.tagToString = function(tag)
	{
		return tag;
	};

	p.grabTagFromInput = function(input)
	{
		var self = this,
			val  = input.val()
			;

		if(val.length == 0)
			return;

		self.addTag(self.stringToTag(val));
		input.val('');
	};

	p.getTagElements = function()
	{
		return this.getTagsContainer().find('.tag');
	};

	p.addTag = function(tag)
	{
		var self          = this,
			tagsContainer = self.getTagsContainer()
			;
		tagsContainer.append(self.renderTag(tag));
		self.updateBox();
	};

	p.renderTag = function(tag)
	{
		var self = this,
			node = $(self.opts.html.tag)
			;
		node.find('.label').text(self.tagToString(tag));
		return node;
	};

	$.fn.autosuggest = function(opts)
	{
		return this.each(function()
		{
			 new AutoSuggest().init(this, opts);
		});
	};

	$.fn.autosuggest.prototype = p;
})(jQuery);
