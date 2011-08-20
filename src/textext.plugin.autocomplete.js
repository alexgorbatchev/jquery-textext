(function($)
{
	/**
	 * Autocomplete plugin brings the classic autocomplete functionality to the TextExt echosystem.
	 * The gist of functionality is when user starts typing in, for example a term or a tag, a
	 * dropdown would be presented with possible suggestions to complete the input quicker.
	 *
	 * @author agorbatchev
	 * @date 2011/08/17
	 * @id TextExtAutocomplete
	 */
	function TextExtAutocomplete() {};

	$.fn.textext.TextExtAutocomplete = TextExtAutocomplete;
	$.fn.textext.addPlugin('autocomplete', TextExtAutocomplete);

	var p = TextExtAutocomplete.prototype,
		
		CSS_DOT            = '.',
		CSS_SELECTED       = 'text-selected',
		CSS_DOT_SELECTED   = CSS_DOT + CSS_SELECTED,
		CSS_SUGGESTION     = 'text-suggestion',
		CSS_DOT_SUGGESTION = CSS_DOT + CSS_SUGGESTION,

		/**
		 * Autocomplete plugin options are grouped under `autocomplete` when passed to the 
		 * `$().textext()` function. For example:
		 *
		 *     $('textarea').textext({
		 *         plugins: 'autocomplete',
		 *         autocomplete: {
		 *             dropdownPosition: 'above'
		 *         }
		 *     })
		 *
		 * @author agorbatchev
		 * @date 2011/08/17
		 * @id TextExtAutocomplete.options
		 */

		/**
		 * This is a toggle switch to enable or disable the Autucomplete plugin. The value is checked
		 * each time at the top level which allows you to toggle this setting on the fly.
		 *
		 * @name autocomplete.enabled
		 * @default true
		 * @author agorbatchev
		 * @date 2011/08/17
		 * @id TextExtAutocomplete.options.autocomplete.enabled
		 */
		OPT_ENABLED = 'autocomplete.enabled',

		/**
		 * This option allows to specify position of the dropdown. The two possible values
		 * are `above` and `below`.
		 *
		 * @name autocomplete.dropdown.position
		 * @default "below"
		 * @author agorbatchev
		 * @date 2011/08/17
		 * @id TextExtAutocomplete.options.autocomplete.dropdown.position
		 */
		OPT_POSITION = 'autocomplete.dropdown.position',

		/**
		 * HTML source that is used to generate the dropdown.
		 *
		 * @name html.dropdown
		 * @default '<div class="text-dropdown"><div class="text-list"/></div>'
		 * @author agorbatchev
		 * @date 2011/08/17
		 * @id TextExtAutocomplete.options.html.dropdown
		 */
		OPT_HTML_DROPDOWN = 'html.dropdown',

		/**
		 * HTML source that is used to generate each suggestion.
		 *
		 * @name html.suggestion
		 * @default '<div class="text-suggestion"><span class="text-label"/></div>'
		 * @author agorbatchev
		 * @date 2011/08/17
		 * @id TextExtAutocomplete.options.html.suggestion
		 */
		OPT_HTML_SUGGESTION = 'html.suggestion',

		/**
		 * Autocomplete plugin triggers or reacts to the following events.
		 *
		 * @author agorbatchev
		 * @date 2011/08/17
		 * @id TextExtAutocomplete.events
		 */
	
		/**
		 * Autocomplete plugin triggers and reacts to the `hideDropdown` to hide the dropdown if it's 
		 * already visible.
		 *
		 * @name hideDropdown
		 * @author agorbatchev
		 * @date 2011/08/17
		 * @id TextExtAutocomplete.events.hideDropdown
		 */
		EVENT_HIDE_DROPDOWN = 'hideDropdown',

		/**
		 * Autocomplete plugin triggers and reacts to the `showDropdown` to show the dropdown if it's 
		 * not already visible.
		 *
		 * It's possible to pass a render callback function which will be called instead of the
		 * default `TextExtAutocomplete.renderSuggestions()`. 
		 *
		 * Here's how another plugin should trigger this event with the optional render callback:
		 *
		 *     this.trigger('showDropdown', function(autocomplete)
		 *     {
		 *         autocomplete.clearItems();
		 *         var node = autocomplete.addDropdownItem('<b>Item</b>');
		 *         node.addClass('new-look');
		 *     });
		 *
		 * @name showDropdown
		 * @author agorbatchev
		 * @date 2011/08/17
		 * @id TextExtAutocomplete.events.showDropdown
		 */
		EVENT_SHOW_DROPDOWN = 'showDropdown',

		/**
		 * Autocomplete plugin reacts to the `setSuggestions` event triggered by other plugins which
		 * wish to populate the suggestion items. Suggestions should be passed as event argument in the 
		 * following format: `{ data : [ ... ] }`. 
		 *
		 * Here's how another plugin should trigger this event:
		 *
		 *     this.trigger('setSuggestions', { data : [ "item1", "item2" ] });
		 *
		 * @name setSuggestions
		 * @author agorbatchev
		 * @date 2011/08/17
		 * @id TextExtAutocomplete.events.setSuggestions
		 */

		/**
		 * Autocomplete plugin triggers the `getSuggestions` event and expects to get results by listening for
		 * the `setSuggestions` event.
		 *
		 * @name getSuggestions
		 * @author agorbatchev
		 * @date 2011/08/17
		 * @id TextExtAutocomplete.events.getSuggestions
		 */
		EVENT_GET_SUGGESTIONS = 'getSuggestions',

		/**
		 * Autocomplete plugin triggers `setFormData` event with the current suggestion so that the the core
		 * will be updated with serialized data to be submitted with the HTML form.
		 * 
		 * @name setFormData
		 * @author agorbatchev
		 * @date 2011/08/18
		 * @id TextExtAutocomplete.events.setFormData
		 */
		EVENT_SET_FORM_DATA = 'setFormData',

		/**
		 * Autocomplete plugin triggers the `selectItem` event to indicate that a new selection has been made.
		 * Selection value is passed as the second argument.
		 * 
		 * @name selectItem
		 * @author agorbatchev
		 * @date 2011/08/18
		 * @id TextExtAutocomplete.events.selectItem
		 */
		EVENT_SELECT_ITEM = 'selectItem',

		POSITION_ABOVE = 'above',
		POSITION_BELOW = 'below',

		DEFAULT_OPTS = {
			autocomplete : {
				enabled          : true,
				dropdownPosition : POSITION_BELOW
			},

			html : {
				dropdown   : '<div class="text-dropdown"><div class="text-list"/></div>',
				suggestion : '<div class="text-suggestion"><span class="text-label"/></div>'
			}
		}
		;

	/**
	 * Initialization method called by the core during plugin instantiation.
	 *
	 * @signature TextExtAutocomplete.init(core)
	 *
	 * @param core {TextExt} Instance of the TextExt core class.
	 *
	 * @author agorbatchev
	 * @date 2011/08/17
	 * @id TextExtAutocomplete.init
	 */
	p.init = function(core)
	{
		var self = this;

		self.baseInit(core, DEFAULT_OPTS);

		var input = self.input(),
			container
			;

		if(self.opts(OPT_ENABLED) === true)
		{
			self.on({
				click          : self.onClick,
				blur           : self.onBlur,
				anyKeyUp       : self.onAnyKeyUp,
				deleteKeyUp    : self.onAnyKeyUp,
				backspaceKeyUp : self.onBackspaceKeyUp,
				downKeyDown    : self.onDownKeyDown,
				upKeyDown      : self.onUpKeyDown,
				enterKeyDown   : self.onEnterKeyDown,
				escapeKeyUp    : self.onEscapeKeyUp,
				setSuggestions : self.onSetSuggestions,
				showDropdown   : self.onShowDropdown,
				hideDropdown   : self.onHideDropdown,
				postInvalidate : self.positionDropdown
			});

			input.after(self.opts(OPT_HTML_DROPDOWN));
			container = self.getDropdownContainer();
			container
				.mouseover(function(e) { self.onMouseOver(e) })
				.addClass('text-position-' + self.opts(OPT_POSITION))
				;

			self.positionDropdown();
		}
	};

	/**
	 * Returns top level dropdown container HTML element.
	 * 
	 * @signature TextExtAutocomplete.getDropdownContainer()
	 * 
	 * @author agorbatchev
	 * @date 2011/08/15
	 * @id TextExtAutocomplete.getDropdownContainer
	 */
	p.getDropdownContainer = function()
	{
		return this.input().siblings('.text-dropdown');
	};

	//--------------------------------------------------------------------------------
	// User mouse/keyboard input
	
	/**
	 * Reacts to the `mouseOver` event triggered by the TextExt core.
	 *
	 * @signature TextExtAutocomplete.onMouseOver(e)
	 *
	 * @param e {Object} jQuery event.
	 *
	 * @author agorbatchev
	 * @date 2011/08/17
	 * @id TextExtAutocomplete.onMouseOver
	 */
	p.onMouseOver = function(e)
	{
		var self   = this,
			target = $(e.target)
			;

		if(target.is(CSS_DOT_SUGGESTION))
		{
			self.clearSelected();
			target.addClass(CSS_SELECTED);
		}
	};

	/**
	 * Reacts to the `click` event triggered by the TextExt core.
	 *
	 * @signature TextExtAutocomplete.onClick(e)
	 *
	 * @param e {Object} jQuery event.
	 *
	 * @author agorbatchev
	 * @date 2011/08/17
	 * @id TextExtAutocomplete.onClick
	 */
	p.onClick = function(e)
	{
		var self   = this,
			target = $(e.target)
			;

		if(target.is(CSS_DOT_SUGGESTION))
			self.selectFromDropdown();
	};

	/**
	 * Reacts to the `blur` event triggered by the TextExt core.
	 *
	 * @signature TextExtAutocomplete.onBlur(e)
	 *
	 * @param e {Object} jQuery event.
	 *
	 * @author agorbatchev
	 * @date 2011/08/17
	 * @id TextExtAutocomplete.onBlur
	 */
	p.onBlur = function(e)
	{
		var self = this;

		// use timeout here so that onClick has a chance to fire because if
		// dropdown is hidden when clicked, onClick doesn't fire
		if(self.isDropdownVisible())
			setTimeout(function() { self.trigger(EVENT_HIDE_DROPDOWN) }, 100);
	};

	/**
	 * Reacts to the `backspaceKeyUp` event triggered by the TextExt core.
	 *
	 * @signature TextExtAutocomplete.onBackspaceKeyUp(e)
	 *
	 * @param e {Object} jQuery event.
	 *
	 * @author agorbatchev
	 * @date 2011/08/17
	 * @id TextExtAutocomplete.onBackspaceKeyUp
	 */
	p.onBackspaceKeyUp = function(e)
	{
		var self = this,
			isEmpty = self.input().val().length > 0
			;

		if(isEmpty || self.isDropdownVisible())
			self.getSuggestions();
	};

	/**
	 * Reacts to the `anyKeyUp` event triggered by the TextExt core.
	 *
	 * @signature TextExtAutocomplete.onAnyKeyUp(e)
	 *
	 * @param e {Object} jQuery event.
	 *
	 * @author agorbatchev
	 * @date 2011/08/17
	 * @id TextExtAutocomplete.onAnyKeyUp
	 */
	p.onAnyKeyUp = function(e)
	{
		this.getSuggestions();
	};

	/**
	 * Reacts to the `downKeyDown` event triggered by the TextExt core.
	 *
	 * @signature TextExtAutocomplete.onDownKeyDown(e)
	 *
	 * @param e {Object} jQuery event.
	 *
	 * @author agorbatchev
	 * @date 2011/08/17
	 * @id TextExtAutocomplete.onDownKeyDown
	 */
	p.onDownKeyDown = function(e)
	{
		var self = this;

		self.isDropdownVisible()
			? self.toggleNextSuggestion() 
			: self.getSuggestions()
			;
	};

	/**
	 * Reacts to the `upKeyDown` event triggered by the TextExt core.
	 *
	 * @signature TextExtAutocomplete.onUpKeyDown(e)
	 *
	 * @param e {Object} jQuery event.
	 *
	 * @author agorbatchev
	 * @date 2011/08/17
	 * @id TextExtAutocomplete.onUpKeyDown
	 */
	p.onUpKeyDown = function(e)
	{
		this.togglePreviousSuggestion();
	};

	/**
	 * Reacts to the `enterKeyDown` event triggered by the TextExt core.
	 *
	 * @signature TextExtAutocomplete.onEnterKeyDown(e)
	 *
	 * @param e {Object} jQuery event.
	 *
	 * @author agorbatchev
	 * @date 2011/08/17
	 * @id TextExtAutocomplete.onEnterKeyDown
	 */
	p.onEnterKeyDown = function(e)
	{
		var self = this;

		if(self.isDropdownVisible())
			self.selectFromDropdown();
	};

	/**
	 * Reacts to the `escapeKeyUp` event triggered by the TextExt core.
	 *
	 * @signature TextExtAutocomplete.onEscapeKeyUp(e)
	 *
	 * @param e {Object} jQuery event.
	 *
	 * @author agorbatchev
	 * @date 2011/08/17
	 * @id TextExtAutocomplete.onEscapeKeyUp
	 */
	p.onEscapeKeyUp = function(e)
	{
		var self = this;

		if(self.isDropdownVisible())
			self.trigger(EVENT_HIDE_DROPDOWN);
	};

	//--------------------------------------------------------------------------------
	// Core functionality

	/**
	 * Positions dropdown either below or above the input based on the `autocomplete.dropdown.position`
	 * option specified, which could be either `above` or `below`.
	 *
	 * @signature TextExtAutocomplete.positionDropdown()
	 *
	 * @author agorbatchev
	 * @date 2011/08/15
	 * @id TextExtAutocomplete.positionDropdown
	 */
	p.positionDropdown = function()
	{
		var self      = this,
			container = self.getDropdownContainer(),
			direction = self.opts(OPT_POSITION),
			height    = self.core().getWrapContainer().outerHeight(),
			css       = {}
			;

		css[direction === POSITION_ABOVE ? 'bottom' : 'top'] = height + 'px';
		container.css(css);
	};

	/**
	 * Returns list of all the suggestion HTML elements in the dropdown.
	 *
	 * @signature TextExtAutocomplete.getSuggestionElements()
	 *
	 * @author agorbatchev
	 * @date 2011/08/17
	 * @id TextExtAutocomplete.getSuggestionElements
	 */
	p.getSuggestionElements = function()
	{
		return this.getDropdownContainer().find(CSS_DOT_SUGGESTION);
	};


	/**
	 * Highlights specified suggestion as selected in the dropdown.
	 *
	 * @signature TextExtAutocomplete.setSelectedSuggestion(suggestion)
	 *
	 * @param suggestion {Object} Suggestion object. With the default `ItemManager` this
	 * is expected to be a string, anything else with custom implementations.
	 *
	 * @author agorbatchev
	 * @date 2011/08/17
	 * @id TextExtAutocomplete.setSelectedSuggestion
	 */
	p.setSelectedSuggestion = function(suggestion)
	{
		if(!suggestion)
			return;

		var self   = this,
			all    = self.getSuggestionElements(),
			target = all.first(),
			item, i
			;

		self.clearSelected();

		for(i = 0; i < all.length; i++)
		{
			item = $(all[i]);

			if(self.itemManager().compareItems(item.data(CSS_SUGGESTION), suggestion))
			{
				target = item.addClass(CSS_SELECTED);
				break;
			}
		}

		target.addClass(CSS_SELECTED);
		self.scrollSuggestionIntoView(target);
	};

	/**
	 * Returns the first suggestion HTML element from the dropdown that is highlighted as selected.
	 *
	 * @signature TextExtAutocomplete.getSelectedSuggestionElement()
	 *
	 * @author agorbatchev
	 * @date 2011/08/17
	 * @id TextExtAutocomplete.getSelectedSuggestionElement
	 */
	p.getSelectedSuggestionElement = function()
	{
		return this.getSuggestionElements().filter(CSS_DOT_SELECTED).first();
	};

	/**
	 * Returns `true` if dropdown is currently visible, `false` otherwise.
	 *
	 * @signature TextExtAutocomplete.isDropdownVisible()
	 *
	 * @author agorbatchev
	 * @date 2011/08/17
	 * @id TextExtAutocomplete.isDropdownVisible
	 */
	p.isDropdownVisible = function()
	{
		return this.getDropdownContainer().is(':visible');
	};

	/**
	 * Reacts to the `hideDropdown` event and hides the dropdown if it's already visible.
	 *
	 * @signature TextExtAutocomplete.onHideDropdown(e)
	 *
	 * @param e {Object} jQuery event.
	 *
	 * @author agorbatchev
	 * @date 2011/08/17
	 * @id TextExtAutocomplete.onHideDropdown
	 */
	p.onHideDropdown = function(e)
	{
		this.hideDropdown();
	};

	/**
	 * Reacts to the `showDropdown` event and shows the dropdown if it's not already visible.
	 * It's possible to pass a render callback function which will be called instead of the
	 * default `TextExtAutocomplete.renderSuggestions()`.
	 *
	 * Here's how another plugin should trigger this event with the optional render callback:
	 *
	 *     this.trigger('showDropdown', function(autocomplete)
	 *     {
	 *         autocomplete.clearItems();
	 *         var node = autocomplete.addDropdownItem('<b>Item</b>');
	 *         node.addClass('new-look');
	 *     });
	 *
	 * @signature TextExtAutocomplete.onShowDropdown(e, renderCallback)
	 *
	 * @author agorbatchev
	 * @date 2011/08/17
	 * @id TextExtAutocomplete.onShowDropdown
	 */
	p.onShowDropdown = function(e, renderCallback)
	{
		var self    = this,
			current = self.getSelectedSuggestionElement().data(CSS_SUGGESTION)
			;

		if($.isFunction(renderCallback))
		{
			renderCallback(self)
		}
		else
		{
			self.renderSuggestions(self._suggestions);
			self.toggleNextSuggestion();
		}
		
		self.showDropdown(self.getDropdownContainer());
		self.setSelectedSuggestion(current);
	};

	/**
	 * Reacts to the `setSuggestions` event. Expects to recieve the payload as the second argument
	 * in the following structure:
	 *
	 *     {
	 *         result : [ "item1", "item2" ],
	 *         showHideDropdown : false
	 *     }
	 *
	 * Notice the optional `showHideDropdown` option. By default, ie without the `showHideDropdown` 
	 * value the method will trigger either `showDropdown` or `hideDropdown` depending if there are
	 * suggestions. If set to `false`, no event is triggered.
	 *
	 * @signature TextExtAutocomplete.onSetSuggestions(e, data)
	 *
	 * @param data {Object} Data payload.
	 *
	 * @author agorbatchev
	 * @date 2011/08/17
	 * @id TextExtAutocomplete.onSetSuggestions
	 */
	p.onSetSuggestions = function(e, data)
	{
		var self        = this,
			suggestions = self._suggestions = data.result
			;

		if(data.showHideDropdown != false)
			self.trigger(suggestions == null || suggestions.length == 0 ? EVENT_HIDE_DROPDOWN : EVENT_SHOW_DROPDOWN);
	};

	/**
	 * Prepears for and triggers the `getSuggestions` event with the `{ query : "..." }` as second
	 * argument.
	 *
	 * @signature TextExtAutocomplete.getSuggestions()
	 *
	 * @author agorbatchev
	 * @date 2011/08/17
	 * @id TextExtAutocomplete.getSuggestions
	 */
	p.getSuggestions = function()
	{
		var self = this,
			val  = self.input().val()
			;

		if(self._previousInputValue == val)
			return;

		// if user clears input, then we want to select first suggestion
		// instead of the last one
		if(val == '')
			current = null;

		self._previousInputValue = val;
		self.trigger(EVENT_GET_SUGGESTIONS, { query : val });
	};

	/**
	 * Removes all HTML suggestion items from the dropdown.
	 *
	 * @signature TextExtAutocomplete.clearItems()
	 *
	 * @author agorbatchev
	 * @date 2011/08/17
	 * @id TextExtAutocomplete.clearItems
	 */
	p.clearItems = function()
	{
		this.getDropdownContainer().find('.text-list').children().remove();
	};

	/**
	 * Clears all and renders passed suggestions.
	 *
	 * @signature TextExtAutocomplete.renderSuggestions(suggestions)
	 *
	 * @param suggestions {Array} List of suggestions to render.
	 *
	 * @author agorbatchev
	 * @date 2011/08/17
	 * @id TextExtAutocomplete.renderSuggestions
	 */
	p.renderSuggestions = function(suggestions)
	{
		var self = this;

		self.clearItems();

		$.each(suggestions || [], function(index, item)
		{
			self.addSuggestion(item);
		});
	};

	/**
	 * Shows the dropdown.
	 *
	 * @signature TextExtAutocomplete.showDropdown()
	 *
	 * @author agorbatchev
	 * @date 2011/08/17
	 * @id TextExtAutocomplete.showDropdown
	 */
	p.showDropdown = function()
	{
		this.getDropdownContainer().show();
	};

	/**
	 * Hides the dropdown.
	 *
	 * @signature TextExtAutocomplete.hideDropdown()
	 *
	 * @author agorbatchev
	 * @date 2011/08/17
	 * @id TextExtAutocomplete.hideDropdown
	 */
	p.hideDropdown = function()
	{
		var self     = this,
			dropdown = self.getDropdownContainer()
			;

		self._previousInputValue = null;
		dropdown.hide();
	};

	/**
	 * Adds single suggestion to the bottom of the dropdown. Uses `ItemManager.itemToString()` to
	 * serialize provided suggestion to string.
	 *
	 * @signature TextExtAutocomplete.addSuggestion(suggestion)
	 *
	 * @param suggestion {Object} Suggestion item. By default expected to be a string.
	 *
	 * @author agorbatchev
	 * @date 2011/08/17
	 * @id TextExtAutocomplete.addSuggestion
	 */
	p.addSuggestion = function(suggestion)
	{
		var self = this,
			node = self.addDropdownItem(self.itemManager().itemToString(suggestion))
			;

		node.data(CSS_SUGGESTION, suggestion);
	};

	/**
	 * Adds and returns HTML node to the bottom of the dropdown.
	 *
	 * @signature TextExtAutocomplete.addDropdownItem(html)
	 *
	 * @param html {String} HTML to be inserted into the item.
	 *
	 * @author agorbatchev
	 * @date 2011/08/17
	 * @id TextExtAutocomplete.addDropdownItem
	 */
	p.addDropdownItem = function(html)
	{
		var self      = this,
			container = self.getDropdownContainer().find('.text-list'),
			node      = $(self.opts(OPT_HTML_SUGGESTION))
			;

		node.find('.text-label').text(html);
		container.append(node);
		return node;
	};

	/**
	 * Removes selection highlight from all suggestion elements.
	 *
	 * @signature TextExtAutocomplete.clearSelected()
	 *
	 * @author agorbatchev
	 * @date 2011/08/02
	 * @id TextExtAutocomplete.clearSelected
	 */
	p.clearSelected = function()
	{
		this.getSuggestionElements().removeClass(CSS_SELECTED);
	};

	/**
	 * Selects next suggestion relative to the current one. If there's no
	 * currently selected suggestion, it will select the first one. Selected
	 * suggestion will always be scrolled into view.
	 *
	 * @signature TextExtAutocomplete.toggleNextSuggestion()
	 *
	 * @author agorbatchev
	 * @date 2011/08/02
	 * @id TextExtAutocomplete.toggleNextSuggestion
	 */
	p.toggleNextSuggestion = function()
	{
		var self     = this,
			selected = self.getSelectedSuggestionElement(),
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

	/**
	 * Selects previous suggestion relative to the current one. Selected
	 * suggestion will always be scrolled into view.
	 *
	 * @signature TextExtAutocomplete.togglePreviousSuggestion()
	 *
	 * @author agorbatchev
	 * @date 2011/08/02
	 * @id TextExtAutocomplete.togglePreviousSuggestion
	 */
	p.togglePreviousSuggestion = function()
	{
		var self     = this,
			selected = self.getSelectedSuggestionElement(),
			prev     = selected.prev()
			;

		if(prev.length == 0)
			return;

		self.clearSelected();
		prev.addClass(CSS_SELECTED);
		self.scrollSuggestionIntoView(prev);
	};

	/**
	 * Scrolls specified HTML suggestion element into the view.
	 *
	 * @signature TextExtAutocomplete.scrollSuggestionIntoView(item)
	 *
	 * @param item {HTMLElement} jQuery HTML suggestion element which needs to
	 * scrolled into view.
	 *
	 * @author agorbatchev
	 * @date 2011/08/17
	 * @id TextExtAutocomplete.scrollSuggestionIntoView
	 */
	p.scrollSuggestionIntoView = function(item)
	{
		var itemHeight     = item.outerHeight(),
			dropdown       = this.getDropdownContainer(),
			dropdownHeight = dropdown.innerHeight(),
			scrollPos      = dropdown.scrollTop(),
			itemTop        = (item.position() || {}).top,
			scrollTo       = null,
			paddingTop     = parseInt(dropdown.css('paddingTop'))
			;

		if(itemTop == null)
			return;

		// if scrolling down and item is below the bottom fold
		if(itemTop + itemHeight > dropdownHeight)
			scrollTo = itemTop + scrollPos + itemHeight - dropdownHeight + paddingTop;

		// if scrolling up and item is above the top fold
		if(itemTop < 0)
			scrollTo = itemTop + scrollPos - paddingTop;

		if(scrollTo != null)
			dropdown.scrollTop(scrollTo);
	};

	/**
	 * Uses the value from the text input to finish autocomplete action. Currently selected
	 * suggestion from the dropdown will be used to complete the action. Triggers `setFormData`
	 * and `selectItem` events.
	 *
	 * `setFormData` event is triggered with the current suggestion so that the the core will
	 * be updated with serialized data to be submitted with the HTML form.
	 *
	 * `selectItem` event is triggered to indicate that a new selection has been made.
	 *
	 * @signature TextExtAutocomplete.selectFromDropdown()
	 *
	 * @author agorbatchev
	 * @date 2011/08/17
	 * @id TextExtAutocomplete.selectFromDropdown
	 */
	p.selectFromDropdown = function()
	{
		var self       = this,
			suggestion = self.getSelectedSuggestionElement().data(CSS_SUGGESTION)
			;

		if(suggestion)
		{
			self.input().val(self.itemManager().itemToString(suggestion));
			self.trigger(EVENT_SET_FORM_DATA, suggestion);
			self.trigger(EVENT_SELECT_ITEM, suggestion);
		}

		self.trigger(EVENT_HIDE_DROPDOWN);
	};
})(jQuery);
