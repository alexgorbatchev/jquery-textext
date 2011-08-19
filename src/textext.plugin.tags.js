(function($)
{
	function TextExtTags()
	{
	};

	$.fn.textext.TextExtTags = TextExtTags;
	$.fn.textext.addPlugin('tags', TextExtTags);

	var p = TextExtTags.prototype,

		CSS_DOT             = '.',
		CSS_TAGS_ON_TOP     = 'text-tags-on-top',
		CSS_DOT_TAGS_ON_TOP = CSS_DOT + CSS_TAGS_ON_TOP,
		CSS_TAG             = 'text-tag',
		CSS_DOT_TAG         = CSS_DOT + CSS_TAG,
		CSS_TAGS            = 'text-tags',
		CSS_DOT_TAGS        = CSS_DOT + CSS_TAGS,

		OPT_ENABLED   = 'tags.enabled',
		OPT_HTML_TAG  = 'html.tag',
		OPT_HTML_TAGS = 'html.tags',
		OPT_ITEMS     = 'items',

		EVENT_IS_TAG_ALLOWED = 'isTagAllowed',
		EVENT_SET_DATA       = 'setData',
		EVENT_SELECT_ITEM    = 'selectItem',

		DEFAULT_OPTS = {
			tagsEnabled : true,
			items : [],

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
			input = self.input()
			;

		if(self.opts(OPT_ENABLED))
		{
			input.after(self.opts(OPT_HTML_TAGS));

			self.on({
				enterKeyUp       : self.onEnterKeyUp,
				preInvalidate    : self.onPreInvalidate,
				selectItem       : self.onSelectItem,
				backspaceKeyDown : self.onBackspaceKeyDown,
				postInit         : self.onPostInit
			});

			self.getContainer()
				.click(function(e) { self.onClick(e) })
				.mousemove(function(e) { self.onContainerMouseMove(e) })
				;

			input
				.mousemove(function(e) { self.onInputMouseMove(e) })
				;
		}

		self._originalPadding = { 
			left : parseInt(input.css('paddingLeft') || 0),
			top  : parseInt(input.css('paddingTop') || 0)
		};

		self._paddingBox = {
			left : 0,
			top  : 0
		};
	};

	/**
	 * Returns HTML element in which all tag HTML elements are residing.
	 * @author agorbatchev
	 * @date 2011/08/15
	 */
	p.getContainer = function()
	{
		return this.core().input().siblings(CSS_DOT_TAGS);
	};

	//--------------------------------------------------------------------------------
	// Event handlers
	
	/**
	 * Reacts to the `postInit` event triggered by the core and sets default tags
	 * if any were specified.
	 * @author agorbatchev
	 * @date 2011/08/09
	 */
	p.onPostInit = function(e)
	{
		var self = this;
		self.addTags(self.opts(OPT_ITEMS));
	};

	/**
	 * Reacts to user moving mouse over the text area when cursor is over the text
	 * and not over the tags. Whenever mouse cursor is over the area covered by
	 * tags, the tags container is flipped to be on top of the text area which
	 * makes all tags functional with the mouse.
	 * @author agorbatchev
	 * @date 2011/08/08
	 */
	p.onInputMouseMove = function(e)
	{
		this.toggleZIndex(e);
	};

	/**
	 * Reacts to user moving mouse over the tags. Whenever the cursor moves out
	 * of the tags and back into where the text input is happening visually,
	 * the tags container is sent back under the text area which allows user
	 * to interact with the text using mouse cursor as expected.
	 * @author agorbatchev
	 * @date 2011/08/08
	 */
	p.onContainerMouseMove = function(e)
	{
		this.toggleZIndex(e);
	};

	/**
	 * Reacts to `selectItem` event triggered by the Autocomplete plugin.
	 * @author agorbatchev
	 * @date 2011/08/02
	 */
	p.onSelectItem = function(e, tag)
	{
		this.addTag(tag);
	};

	/**
	 * When backspace key is pressed in an empty text field, deletes last tag in the list.
	 * @author agorbatchev
	 * @date 2011/08/02
	 */
	p.onBackspaceKeyDown = function(e)
	{
		var self    = this,
			lastTag = self.getAllTagElements().last()
			;

		if(self.input().val().length == 0)
			self.removeTag(lastTag);
	};

	p.onPreInvalidate = function()
	{
		var self    = this,
			lastTag = self.getAllTagElements().last(),
			pos     = lastTag.position()
			;
		
		if(lastTag.length > 0)
			pos.left += lastTag.innerWidth();
		else
			pos = self._originalPadding;

		self._paddingBox = pos;

		self.input().css({
			paddingLeft : pos.left,
			paddingTop  : pos.top
		});
	};

	p.onClick = function(e)
	{
		var self   = this,
			source = $(e.target),
			focus  = 0
			;

		if(source.is(CSS_DOT_TAGS))
		{
			focus = 1;
		}
		else if(source.is('.text-remove'))
		{
			self.removeTag(source.parents(CSS_DOT_TAG + ':first'));
			focus = 1;
		}

		if(focus)
			self.core().focusInput();
	};

	p.onEnterKeyUp = function(e)
	{
		var self = this,
			input = self.input(),
			val, tag
			;

		if(self.opts(OPT_ENABLED))
		{
			val = input.val();
			tag = self.itemManager().stringToItem(val);
			self.trigger(EVENT_SELECT_ITEM, tag);
			// clear the textarea after it was grabbed as a tag
			input.val('');
			// refocus the textarea just in case it lost the focus
			input.focus();
		}
	};

	//--------------------------------------------------------------------------------
	// Core functionality

	/**
	 * Triggeres `setData` event with array of tag values. The `setData` event is
	 * processed by the core which in turn sets original text input's value.
	 * @author agorbatchev
	 * @date 2011/08/09
	 */
	p.setData = function()
	{
		var self   = this,
			result = []
			;

		self.getAllTagElements().each(function()
		{
			result.push($(this).data(CSS_TAG));
		});

		self.trigger(EVENT_SET_DATA, result, result.length > 0);
	};

	/**
	 * Toggles tag container to be on top of the text area or under based on where
	 * the mouse cursor is located. When cursor is above the text input and out of
	 * any of the tags, the tags container is sent under the text area. If cursor
	 * is over any of the tags, the tag container is brought to be over the text
	 * area.
	 * @param e event Original mouse event.
	 * @author agorbatchev
	 * @date 2011/08/08
	 */
	p.toggleZIndex = function(e)
	{
		var self            = this,
			offset          = self.input().offset(),
			mouseX          = e.clientX - offset.left,
			mouseY          = e.clientY - offset.top,
			box             = self._paddingBox,
			container       = self.getContainer(),
			isOnTop         = container.is(CSS_DOT_TAGS_ON_TOP),
			isMouseOverText = mouseX > box.left && mouseY > box.top
			;

		if(!isOnTop && !isMouseOverText || isOnTop && isMouseOverText)
			container[(!isOnTop ? 'add' : 'remove') + 'Class'](CSS_TAGS_ON_TOP);
	};

	p.getAllTagElements = function()
	{
		return this.getContainer().find(CSS_DOT_TAG);
	};

	p.isTagAllowed = function(tag)
	{
		var opts = { tag : tag, result : true };
		this.trigger(EVENT_IS_TAG_ALLOWED, opts);
		return opts.result === true;
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

		self.setData();
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
			if(self.itemManager().compareItems(item.data(CSS_TAG), tag))
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
			tag = tag.data(CSS_TAG);
		}
		else
		{
			element = self.getTagElement(tag);
		}

		element.remove();
		self.setData();
		self.core().invalidateBounds();
	};

	p.renderTag = function(tag)
	{
		var self = this,
			node = $(self.opts(OPT_HTML_TAG))
			;

		node.find('.text-label').text(self.itemManager().itemToString(tag));
		node.data(CSS_TAG, tag);
		return node;
	};
})(jQuery);
