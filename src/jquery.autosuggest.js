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
				tag : '<div class="tag"><button><span class="label"/><a class="remove"/></button></div>'
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

		self.getWrapContainer().click(function(e) { return self.onClick(e); });

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

	p.getWrapContainer = function()
	{
		return this.getInput().parent();
	};

	p.updateBox = function()
	{
		var self      = this,
			input     = self.getInput(),
			wrap      = self.getWrapContainer(),
			container = wrap.parent(),
			width     = self.inputWidth,
			lastTag   = self.getAllTagElements().last(),
			pos       = lastTag.position(),
			height
			;
		
		if(lastTag.length > 0)
			pos.left += lastTag.innerWidth();
		else
			pos = { left : self.inputPaddingLeft, top : self.inputPaddingTop };

		input.css({
			paddingLeft : pos.left,
			paddingTop  : pos.top
		});

		height = input.outerHeight()

		input.width(width);
		wrap.width(width).height(height);
		container.height(height);
	};

	p.focusInput = function()
	{
		this.getInput()[0].focus();
	};

	p.onClick = function(e)
	{
		var self   = this,
			source = $(e.srcElement)
			;

		function tag()
		{
			return source.parents('.tag:first');
		};

		if(source.is('.tags'))
			self.focusInput();
		else if(source.is('.remove'))
			self.removeTag(tag());

		return true;
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
			self.grabTagFromInput(self.getInput());

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

	p.areTagsEqual = function(tag1, tag2)
	{
		return tag1 == tag2;
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

	p.getAllTagElements = function()
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

	p.getTagElement = function(tag)
	{
		var self = this,
			list = self.getAllTagElements(),
			i, item
			;

		for(i = 0; i < list.length; i++)
		{
			item = $(list[i]);
			
			if(self.areTagsEqual(item.data('tag'), tag))
				return item;
		}
	};

	p.removeTag = function(tag)
	{
		var self = this,
			element
			;

		if(tag instanceof $)
			tag = tag.data('tag');
		else
			element = self.getTagElement(tag);

		element.remove();
		self.updateBox();
	};

	p.renderTag = function(tag)
	{
		var self = this,
			node = $(self.opts.html.tag)
			;
		node.find('.label').text(self.tagToString(tag));
		node.data('tag', tag);
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
