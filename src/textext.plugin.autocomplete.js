(function($)
{
	function TextExtAutocomplete()
	{
	};

	$.fn.textext.TextExtAutocomplete = TextExtAutocomplete;
	$.fn.textext.addPlugin('autocomplete', TextExtAutocomplete);

	var p = TextExtAutocomplete.prototype,
		
		CSS_DOT            = '.',
		CSS_SELECTED       = 'text-selected',
		CSS_DOT_SELECTED   = CSS_DOT + CSS_SELECTED,
		CSS_SUGGESTION     = 'text-suggestion',
		CSS_DOT_SUGGESTION = CSS_DOT + CSS_SUGGESTION,

		HIDE_DROPDOWN = 'hideDropdown',
		SHOW_DROPDOWN = 'showDropdown',

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
				click          : self.onClick,
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
	
	p.onClick = function(e)
	{
		var self   = this,
			target = $(e.target)
			;

		if(target.is(CSS_DOT_SUGGESTION))
		{
			self.getSuggestionElements().removeClass(CSS_SELECTED);
			target.addClass(CSS_SELECTED);
			self.selectFromDropdown();
		}
	};

	p.onBlur = function(e)
	{
		var self = this;

		// use timeout here so that onClick has a chance to fire because if
		// dropdown is hidden when clicked, onClick doesn't fire
		if(self.isDropdownVisible())
			setTimeout(function() { self.trigger(HIDE_DROPDOWN) }, 100);
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
			self.trigger(HIDE_DROPDOWN);
	};

	//--------------------------------------------------------------------------------
	// Core functionality

	p.getSuggestionElements = function()
	{
		return this.getDropdownContainer().find(CSS_DOT_SUGGESTION);
	};

	p.setSelectedSuggestion = function(suggestion)
	{
		if(!suggestion)
			return;

		var self = this,
			all  = self.getSuggestionElements(),
			item, i
			;

		all.removeClass(CSS_SELECTED);

		for(i = 0; i < all.length; i++)
		{
			item = $(all[i]);

			if(self.compareItems(item.data(CSS_SUGGESTION), suggestion))
				return item.addClass(CSS_SELECTED);
		}

		all.first().addClass(CSS_SELECTED);
	};

	p.getSelectedSuggestion = function()
	{
		return this.getSuggestionElements().filter(CSS_DOT_SELECTED).first();
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
			current = self.getSelectedSuggestion().data(CSS_SUGGESTION)
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
			self.trigger(suggestions == null || suggestions.length == 0 ? HIDE_DROPDOWN : SHOW_DROPDOWN);
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
		node.data(CSS_SUGGESTION, suggestion);
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
				selected.removeClass(CSS_SELECTED);
		}
		else
		{
			next = self.getSuggestionElements().first();
		}

		next.addClass(CSS_SELECTED);
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

		selected.removeClass(CSS_SELECTED);
		prev.addClass(CSS_SELECTED);
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
			suggestion = self.getSelectedSuggestion().first().data(CSS_SUGGESTION)
			;

		if(suggestion)
		{
			self.input().val(self.itemToString(suggestion));
			self.trigger('selectItem', suggestion);
		}

		self.trigger(HIDE_DROPDOWN);
	};
})(jQuery);
