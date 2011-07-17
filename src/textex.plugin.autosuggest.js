(function($)
{
	function TextExAutosuggest()
	{
	};

	$.fn.textex.TextExAutosuggest = TextExAutosuggest;
	$.fn.textex.addPlugin('autosuggest', TextExAutosuggest);

	var p = TextExAutosuggest.prototype,
		DEFAULT_OPTS = {
			dropdownEnabled : true,
			getSuggestions  : null,

			html : {
				dropdown   : '<div class="dropdown"><div class="list"/></div>',
				suggestion : '<div class="suggestion"><span class="label"/></div>'
			}
		}
		;

	p.init = function(parent)
	{
		this.baseInit(parent, DEFAULT_OPTS);

		var self  = this,
			input = parent.getInput(),
			opts  = parent.getOpts(self)
			;

		if(opts.dropdownEnabled)
		{
			input.after(opts.html.dropdown);

			self.on({
				blur         : self.onBlur,
				otherKeyUp   : self.onOtherKeyUp,
				downKeyDown  : self.onDownKeyDown,
				upKeyDown    : self.onUpKeyDown,
				enterKeyDown : self.onEnterKeyDown,
				escapeKeyUp  : self.onEscapeKeyUp
			});
		}
	};

	p.getDropdownContainer = function()
	{
		return this.getInput().siblings('.dropdown');
	};

	//--------------------------------------------------------------------------------
	// User mouse/keyboard input
	
	p.onBlur = function(e)
	{
		var self = this;

		if(self.isDropdownVisible())
			self.hideDropdown();
	};

	p.onOtherKeyUp = function(e)
	{
		this.doDropdown();
	};

	p.onDownKeyDown = function(e)
	{
		this.toggleNextSuggestion();
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
			self.hideDropdown();
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

			if(self.getParent().compareTags(item.data('suggestion'), suggestion))
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
			getSuggestions = self.getOpts().getSuggestions
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
			node = $(self.getOpts().html.suggestion)
			;

		node.find('.label').text(self.getParent().tagToString(suggestion));
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
			self.getInput().val(self.getParent().tagToString(suggestion));

		self.hideDropdown();
	};
})(jQuery);
