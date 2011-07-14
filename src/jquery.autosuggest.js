(function($)
{
	function AutoSuggest()
	{
	};

	var p = AutoSuggest.prototype,
		DEFAULT_OPTS = {
			tagsEnabled     : true,
			dropdownEnabled : true,
			getSuggestions  : null,

			ex : {},

			html : {
				wrap       : '<div class="autosuggest"><div class="wrap"/></div>',
				tags       : '<div class="tags"/>',
				tag        : '<div class="tag"><div class="button"><span class="label"/><a class="remove"/></div></div>',
				dropdown   : '<div class="dropdown"><div class="list"/></div>',
				suggestion : '<div class="suggestion"><span class="label"/></div>'
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
		$.extend(true, self, opts.ex);

		self.input = input = $(input)
			.wrap(opts.html.wrap)
			.keydown(function(e) { return self.onKeyDown(e) })
			.keyup(function(e) { return self.onKeyUp(e) })
			.blur(function(e) { return self.onBlur(e) })
			;

		if(opts.tagsEnabled) input.after(opts.html.tags);
		if(opts.dropdownEnabled) input.after(opts.html.dropdown);

		self.getWrapContainer().click(function(e) { return self.onClick(e) });

		self.originalWidth = input.outerWidth();
		self.originalPadding = { 
			left : parseInt(input.css('paddingLeft') || 0),
			top  : parseInt(input.css('paddingTop') || 0)
		};

		self.invalidateInputBox();
	};

	p.getInput = function()
	{
		return this.input;
	};

	p.getDropdownContainer = function()
	{
		return this.getInput().siblings('.dropdown');
	};

	p.getTagsContainer = function()
	{
		return this.getInput().siblings('.tags');
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
			lastTag   = self.getAllTagElements().last(),
			pos       = lastTag.position(),
			height
			;
		
		if(lastTag.length > 0)
			pos.left += lastTag.innerWidth();
		else
			pos = self.originalPadding;

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

	//--------------------------------------------------------------------------------
	// User mouse/keyboard input
	
	p.onBlur = function(e)
	{
		var self = this;

		if(self.isDropdownVisible())
			self.hideDropdown();
	};

	p.onClick = function(e)
	{
		var self   = this,
			source = $(e.target)
			;

		function tag() { return source.parents('.tag:first') };

		if(source.is('.tags'))
			self.focusInput();
		else if(source.is('.remove'))
			self.removeTag(tag());

		return true;
	};

	$(['Down', 'Up']).each(function()
	{
		var type = this.toString();

		p['onKey' + type] = function(e)
		{
			var self    = this,
				handler = self['on' + self.opts.keys[e.keyCode] + 'Key' + type],
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
		this.doDropdown();
		return true;
	};

	p.onOtherKeyDown = function(e)
	{
		return true;
	};

	p.onDownKeyDown = function(e)
	{
		this.toggleNextSuggestion();
		return false;
	};

	p.onUpKeyDown = function(e)
	{
		this.togglePreviousSuggestion();
		return false;
	};

	p.onEnterKeyDown = function(e)
	{
		var self = this;

		if(self.isDropdownVisible())
			self.selectFromDropdown();

		if(self.opts.tagsEnabled)
			self.addTagFromInput()

		return false;
	};

	p.onEnterKeyUp = function(e)
	{
		return false;
	};

	p.onEscapeKeyUp = function(e)
	{
		var self = this;

		if(self.isDropdownVisible())
			self.hideDropdown();

		return false;
	};

	//--------------------------------------------------------------------------------
	// Dropdown
	
	p.getAllSuggestions = function()
	{
		return this.getDropdownContainer().find('.suggestion');
	};

	p.setSelectedSuggestion = function(suggestion)
	{
		if(!suggestion)
			return;

		var self = this,
			all  = self.getAllSuggestions(),
			item, i
			;

		all.removeClass('selected');

		for(i = 0; i < all.length; i++)
		{
			item = $(all[i]);

			if(self.compareTags(item.data('suggestion'), suggestion))
				return item.addClass('selected');
		}

		all.first().addClass('selected');
	};

	p.getSelectedSuggestion = function()
	{
		return this.getAllSuggestions().filter('.selected').first();
	};

	p.isDropdownVisible = function()
	{
		return this.getDropdownContainer().is(':visible');
	};

	p.doDropdown = function()
	{
		var self           = this,
			val            = self.getInput().val(),
			dropdown       = self.getDropdownContainer(),
			current        = self.getSelectedSuggestion().data('suggestion'),
			getSuggestions = self.opts.getSuggestions
			;

		if(self.previousInputValue == val)
			return;

		if(getSuggestions == null)
			return self.hideDropdown(dropdown);

		// if user clears input, then we want to select first suggestion
		// instead of the last one
		if(val == '')
			current = null;

		self.previousInputValue = val;

		getSuggestions(val, function(suggestions)
		{
			if(suggestions == null)
				return self.hideDropdown(dropdown);

			self.renderDropdown(suggestions);
			self.showDropdown(dropdown);
			self.setSelectedSuggestion(current);
		});
	};

	p.renderDropdown = function(suggestions)
	{
		var self = this;

		self.getDropdownContainer().find('.list').children().remove();

		$.each(suggestions, function(index, item)
		{
			self.addSuggestion(item);
		});

		self.toggleNextSuggestion();
	};

	p.showDropdown = function(dropdown)
	{
		dropdown = dropdown || this.getDropdownContainer();
		dropdown.show();
	};

	p.hideDropdown = function(dropdown)
	{
		var self = this;
		self.previousInputValue = null;
		dropdown = dropdown || self.getDropdownContainer();
		dropdown.hide();
	};

	p.addSuggestion = function(suggestion)
	{
		var self      = this,
			container = self.getDropdownContainer().find('.list')
			;

		container.append(self.renderSuggestion(suggestion));
	};

	p.renderSuggestion = function(suggestion)
	{
		var self = this,
			node = $(self.opts.html.suggestion)
			;

		node.find('.label').text(self.tagToString(suggestion));
		node.data('suggestion', suggestion);
		return node;
	};

	p.toggleNextSuggestion = function()
	{
		var self     = this,
			selected = self.getSelectedSuggestion(),
			next
			;

		if(selected.length > 0)
		{
			next = selected.next();

			if(next.length > 0)
				selected.removeClass('selected');
		}
		else
		{
			next = self.getAllSuggestions().first();
		}

		next.addClass('selected');
		self.scrollSuggestionIntoView(next);
	};

	p.togglePreviousSuggestion = function()
	{
		var self     = this,
			selected = self.getSelectedSuggestion(),
			prev     = selected.prev()
			;

		if(prev.length == 0)
			return;

		selected.removeClass('selected');
		prev.addClass('selected');
		self.scrollSuggestionIntoView(prev);
	};

	p.scrollSuggestionIntoView = function(item)
	{
		var y         = (item.position() || {}).top,
			height    = item.outerHeight(),
			dropdown  = this.getDropdownContainer(),
			scrollPos = dropdown.scrollTop(),
			scrollTo  = null
			;

		if(y == null)
			return;

		if(y + height > dropdown.innerHeight())
			scrollTo = scrollPos + height;

		if(y < 0)
			scrollTo = scrollPos + y;

		if(scrollTo != null)
			dropdown.scrollTop(scrollTo);
	};

	p.selectFromDropdown = function()
	{
		var self       = this,
			suggestion = self.getSelectedSuggestion().first().data('suggestion')
			;

		if(suggestion)
			self.getInput().val(self.tagToString(suggestion));

		self.hideDropdown();
	};
	//--------------------------------------------------------------------------------
	// Tags

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
			input = self.getInput(),
			val   = input.val()
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
		self.invalidateInputBox();
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
		self.invalidateInputBox();
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

	//--------------------------------------------------------------------------------
	// jQuery Integration
	
	$.fn.autosuggest = function(opts)
	{
		return this.each(function()
		{
			 new AutoSuggest().init(this, opts);
		});
	};

	$.fn.autosuggest.prototype = p;
})(jQuery);
