(function($)
{
	function TextExtAutocomplete()
	{
	};

	$.fn.textext.TextExtAutocomplete = TextExtAutocomplete;
	$.fn.textext.addPlugin('autocomplete', TextExtAutocomplete);

	var p = TextExtAutocomplete.prototype,
		DEFAULT_OPTS = {
			dropdownEnabled : true,

			html : {
				dropdown   : '<div class="text-dropdown"><div class="text-list"/></div>',
				suggestion : '<div class="text-suggestion"><span class="text-label"/></div>'
			}
		}
		;

	p.init = function(parent)
	{
		var self = this;

		self.baseInit(parent, DEFAULT_OPTS);

		var input = self.input(),
			opts  = self.opts()
			;

		if(opts.dropdownEnabled)
		{
			input.after(opts.html.dropdown);

			self.on({
				blur           : self.onBlur,
				otherKeyUp     : self.onOtherKeyUp,
				deleteKeyUp    : self.onOtherKeyUp,
				backspaceKeyUp : self.onOtherKeyUp,
				downKeyDown    : self.onDownKeyDown,
				upKeyDown      : self.onUpKeyDown,
				enterKeyDown   : self.onEnterKeyDown,
				escapeKeyUp    : self.onEscapeKeyUp,
				setSuggestions : self.onSetSuggestions,
				showDropdown   : self.onShowDropdown,
				hideDropdown   : self.onHideDropdown
			});
		}
	};

	p.getDropdownContainer = function()
	{
		return this.input().siblings('.text-dropdown');
	};

	//--------------------------------------------------------------------------------
	// User mouse/keyboard input
	
	p.onBlur = function(e)
	{
		var self = this;

		if(self.isDropdownVisible())
			self.trigger('hideDropdown');
	};

	p.onOtherKeyUp = function(e)
	{
		this.getSuggestions();
	};

	p.onDownKeyDown = function(e)
	{
		var self = this;

		self.isDropdownVisible()
			? self.toggleNextSuggestion() 
			: self.getSuggestions()
			;
	};

	p.onUpKeyDown = function(e)
	{
		this.togglePreviousSuggestion();
	};

	p.onEnterKeyDown = function(e)
	{
		var self = this;

		if(self.isDropdownVisible())
			self.selectFromDropdown();
	};

	p.onEscapeKeyUp = function(e)
	{
		var self = this;

		if(self.isDropdownVisible())
			self.trigger('hideDropdown');
	};

	//--------------------------------------------------------------------------------
	// Core functionality

	p.getSuggestionElements = function()
	{
		return this.getDropdownContainer().find('.text-suggestion');
	};

	p.setSelectedSuggestion = function(suggestion)
	{
		if(!suggestion)
			return;

		var self = this,
			all  = self.getSuggestionElements(),
			item, i
			;

		all.removeClass('selected');

		for(i = 0; i < all.length; i++)
		{
			item = $(all[i]);

			if(self.compareItems(item.data('text-suggestion'), suggestion))
				return item.addClass('text-selected');
		}

		all.first().addClass('text-selected');
	};

	p.getSelectedSuggestion = function()
	{
		return this.getSuggestionElements().filter('.text-selected').first();
	};

	p.isDropdownVisible = function()
	{
		return this.getDropdownContainer().is(':visible');
	};

	p.onHideDropdown = function(e)
	{
		this.hideDropdown();
	};

	p.onShowDropdown = function(e)
	{
		var self    = this,
			current = self.getSelectedSuggestion().data('text-suggestion')
			;
		self.renderDropdown(self.suggestions);
		self.showDropdown(self.getDropdownContainer());
		self.setSelectedSuggestion(current);
	};

	p.onSetSuggestions = function(e, data)
	{
		var self        = this,
			suggestions = self.suggestions = data.result
			;

		if(data.showHideDropdown != false)
			self.trigger(suggestions == null || suggestions.length == 0 ? 'hideDropdown' : 'showDropdown');
	};

	p.getSuggestions = function()
	{
		var self = this,
			val  = self.input().val()
			;

		if(self.previousInputValue == val)
			return;

		// if user clears input, then we want to select first suggestion
		// instead of the last one
		if(val == '')
			current = null;

		self.previousInputValue = val;
		self.trigger('getSuggestions', { query : val });
	};

	p.renderDropdown = function(suggestions)
	{
		var self = this;

		self.getDropdownContainer().find('.text-list').children().remove();

		$.each(suggestions, function(index, item)
		{
			self.addSuggestion(item);
		});

		self.toggleNextSuggestion();
	};

	p.showDropdown = function()
	{
		this.getDropdownContainer().show();
	};

	p.hideDropdown = function()
	{
		var self     = this,
			dropdown = self.getDropdownContainer()
			;
		self.previousInputValue = null;
		dropdown.hide();
	};

	p.addSuggestion = function(suggestion)
	{
		var self      = this,
			container = self.getDropdownContainer().find('.text-list')
			;

		container.append(self.renderSuggestion(suggestion));
	};

	p.renderSuggestion = function(suggestion)
	{
		var self = this,
			node = $(self.opts().html.suggestion)
			;

		node.find('.text-label').text(self.itemToString(suggestion));
		node.data('text-suggestion', suggestion);
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
				selected.removeClass('text-selected');
		}
		else
		{
			next = self.getSuggestionElements().first();
		}

		next.addClass('text-selected');
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

		selected.removeClass('text-selected');
		prev.addClass('text-selected');
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
			suggestion = self.getSelectedSuggestion().first().data('text-suggestion')
			;

		if(suggestion)
			self.input().val(self.itemToString(suggestion));

		self.trigger('hideDropdown');
	};
})(jQuery);
