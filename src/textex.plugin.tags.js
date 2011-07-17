(function($)
{
	function TextExTags()
	{
	};

	$.fn.textex.TextExTags = TextExTags;
	$.fn.textex.addPlugin('tags', TextExTags);

	var p = TextExTags.prototype,
		DEFAULT_OPTS = {
			tagsEnabled : true,

			html : {
				tags : '<div class="tags"/>',
				tag  : '<div class="tag"><div class="button"><span class="label"/><a class="remove"/></div></div>'
			}
		}
		;

	p.init = function(parent)
	{
		this.baseInit(parent, DEFAULT_OPTS);

		var self  = this,
			input = self.getInput(),
			opts  = self.getOpts()
			;

		if(opts.tagsEnabled)
		{
			input.after(opts.html.tags);

			self.on({
				click        :  self.onClick,
				enterKeyDown :  self.onEnterKeyDown,
				invalidate   :  self.onInvalidate
			});
		}

		self.originalPadding = { 
			left : parseInt(input.css('paddingLeft') || 0),
			top  : parseInt(input.css('paddingTop') || 0)
		};

		$.extend(parent, {
			compareTags : self.compareTags,
			tagToString : self.tagToString,
			stringToTag : self.stringToTag
		});
	};

	p.getContainer = function()
	{
		return this.getParent().getInput().siblings('.tags');
	};

	//--------------------------------------------------------------------------------
	// Event handlers
	
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

		self.getInput().css({
			paddingLeft : pos.left,
			paddingTop  : pos.top
		});
	};

	p.onClick = function(e, source)
	{
		var self = this;

		function tag() { return source.parents('.tag:first') };

		if(source.is('.tags'))
			self.getParent().focusInput();
		else if(source.is('.remove'))
			self.removeTag(tag());
	};

	p.onEnterKeyDown = function(e)
	{
		var self = this;

		if(self.getOpts().tagsEnabled)
			self.addTagFromInput();
	};

	//--------------------------------------------------------------------------------
	// Core functionality

	p.stringToTag = function(str)
	{
		return str;
	};

	p.tagToString = function(tag)
	{
		return tag;
	};

	p.compareTags = function(tag1, tag2)
	{
		return tag1 == tag2;
	};

	p.addTagFromInput = function(input)
	{
		var self  = this,
			input = self.getParent().getInput(),
			val   = input.val()
			;

		if(val.length == 0)
			return;

		self.addTag(self.stringToTag(val));
		input.val('');
	};

	p.getAllTagElements = function()
	{
		return this.getContainer().find('.tag');
	};

	p.addTag = function(tag)
	{
		var self      = this,
			container = self.getContainer()
			;

		container.append(self.renderTag(tag));
		self.getParent().invalidateBounds();
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
			
			if(self.compareTags(item.data('tag'), tag))
				return item;
		}
	};

	p.removeTag = function(tag)
	{
		var self = this,
			element
			;

		if(tag instanceof $)
		{
			element = tag;
			tag = tag.data('tag');
		}
		else
		{
			element = self.getTagElement(tag);
		}

		element.remove();
		self.getParent().invalidateInputBox();
	};

	p.renderTag = function(tag)
	{
		var self = this,
			node = $(self.getOpts().html.tag)
			;

		node.find('.label').text(self.tagToString(tag));
		node.data('tag', tag);
		return node;
	};

})(jQuery);
