(function($)
{
	function TextExtTags()
	{
	};

	$.fn.textext.TextExtTags = TextExtTags;
	$.fn.textext.addPlugin('tags', TextExtTags);

	var p = TextExtTags.prototype,
		DEFAULT_OPTS = {
			tagsEnabled : true,

			html : {
				tags : '<div class="text-tags"/>',
				tag  : '<div class="text-tag"><div class="text-button"><span class="text-label"/><a class="text-remove"/></div></div>'
			}
		}
		;

	p.init = function(parent)
	{
		this.baseInit(parent, DEFAULT_OPTS);

		var self  = this,
			input = self.input(),
			opts  = self.opts()
			;

		if(opts.tagsEnabled)
		{
			input.after(opts.html.tags);

			self.on({
				enterKeyDown : self.onEnterKeyDown,
				invalidate   : self.onInvalidate,
				selectItem   : self.onSelectItem
			});

			self.getContainer().click(function(e) { self.onClick(e) });
		}

		self.originalPadding = { 
			left : parseInt(input.css('paddingLeft') || 0),
			top  : parseInt(input.css('paddingTop') || 0)
		};

		self.addTags(opts.items);
	};

	p.getContainer = function()
	{
		return this.core().input().siblings('.text-tags');
	};

	//--------------------------------------------------------------------------------
	// Event handlers
	
	/**
	 * Reacts to `selectItem` event triggered by the Autocomplete plugin.
	 * @author agorbatchev
	 * @date 2011/08/02
	 */
	p.onSelectItem = function(e, suggestion)
	{
		this.addTagFromInput();
	};

	p.onInvalidate = function()
	{
		var self    = this,
			lastTag = self.getAllTagElements().last(),
			pos     = lastTag.position()
			;
		
		if(lastTag.length > 0)
			pos.left += lastTag.innerWidth();
		else
			pos = self.originalPadding;

		self.input().css({
			paddingLeft : pos.left,
			paddingTop  : pos.top
		});
	};

	p.onClick = function(e)
	{
		var self   = this,
			source = $(e.target)
			;

		function tag() { return source.parents('.text-tag:first') };

		if(source.is('.text-tags'))
			self.core().focusInput();
		else if(source.is('.text-remove'))
			self.removeTag(tag());
	};

	p.onEnterKeyDown = function(e)
	{
		var self = this;

		if(self.opts().tagsEnabled)
			self.addTagFromInput();
	};

	//--------------------------------------------------------------------------------
	// Core functionality

	p.addTagFromInput = function()
	{
		var self  = this,
			input = self.core().input(),
			val   = input.val(),
			tag
			;

		if(val.length == 0)
			return;

		tag = self.stringToItem(val);

		if(self.isTagAllowed(tag) == false)
			return;

		self.addTag(tag);
		input.val('');
	};

	p.getAllTagElements = function()
	{
		return this.getContainer().find('.text-tag');
	};

	p.isTagAllowed = function(tag)
	{
		var opts = { tag : tag, result : true };
		this.trigger('isTagAllowed', opts);
		return opts.result;
	};

	p.addTags = function(tags)
	{
		if(!tags || tags.length == 0)
			return;

		var self      = this,
			container = self.getContainer(),
			i, tag
			;

		for(i = 0; i < tags.length, tag = tags[i]; i++)
			if(self.isTagAllowed(tag))
				container.append(self.renderTag(tag));

		self.core().invalidateBounds();
	};

	p.addTag = function(tag)
	{
		this.addTags([tag]);
	};

	p.getTagElement = function(tag)
	{
		var self = this,
			list = self.getAllTagElements(),
			i, item
			;

		for(i = 0; i < list.length, item = $(list[i]); i++)
			if(self.compareItems(item.data('text-tag'), tag))
				return item;
	};

	p.removeTag = function(tag)
	{
		var self = this,
			element
			;

		if(tag instanceof $)
		{
			element = tag;
			tag = tag.data('text-tag');
		}
		else
		{
			element = self.getTagElement(tag);
		}

		element.remove();
		self.core().invalidateBounds();
	};

	p.renderTag = function(tag)
	{
		var self = this,
			node = $(self.opts().html.tag)
			;

		node.find('.text-label').text(self.itemToString(tag));
		node.data('text-tag', tag);
		return node;
	};
})(jQuery);
