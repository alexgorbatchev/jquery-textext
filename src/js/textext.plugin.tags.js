/**
 * jQuery TextExt Plugin
 * http://textextjs.com
 *
 * @version 1.3.0
 * @copyright Copyright (C) 2011 Alex Gorbatchev. All rights reserved.
 * @license MIT License
 */
(function($)
{
	/**
	 * Tags plugin brings in the traditional tag functionality where user can assemble and
	 * edit list of tags. Tags plugin works especially well together with Autocomplete, Filter,
	 * Suggestions and Ajax plugins to provide full spectrum of features. It can also work on
	 * its own and just do one thing -- tags.
	 *
	 * @author agorbatchev
	 * @date 2011/08/19
	 * @id tags
	 */
	function PluginTags() {};

	$.fn.textext.PluginTags = PluginTags;
	$.fn.textext.addPlugin('tags', PluginTags);

	var p = PluginTags.prototype,

		CSS_DOT             = '.',
		CSS_TAGS_ON_TOP     = 'text-tags-on-top',
		CSS_DOT_TAGS_ON_TOP = CSS_DOT + CSS_TAGS_ON_TOP,
		CSS_TAG             = 'text-tag',
		CSS_DOT_TAG         = CSS_DOT + CSS_TAG,
		CSS_TAGS            = 'text-tags',
		CSS_DOT_TAGS        = CSS_DOT + CSS_TAGS,
		CSS_LABEL           = 'text-label',
		CSS_DOT_LABEL       = CSS_DOT + CSS_LABEL,
		CSS_REMOVE          = 'text-remove',
		CSS_DOT_REMOVE      = CSS_DOT + CSS_REMOVE,

		/**
		 * Tags plugin options are grouped under `tags` when passed to the
		 * `$().textext()` function. For example:
		 *
		 *     $('textarea').textext({
		 *         plugins: 'tags',
		 *         tags: {
		 *             items: [ "tag1", "tag2" ]
		 *         }
		 *     })
		 *
		 * @author agorbatchev
		 * @date 2011/08/19
		 * @id options
		 */

		/**
		 * This is a toggle switch to enable or disable the Tags plugin. The value is checked
		 * each time at the top level which allows you to toggle this setting on the fly.
		 *
		 * @name tags.enabled
		 * @default true
		 * @author agorbatchev
		 * @date 2011/08/19
		 * @id options.tags.enabled
		 */
		OPT_ENABLED = 'tags.enabled',

		OPT_HOT_KEY = 'tags.hotKey',

		/**
		 * Allows to specify tags which will be added to the input by default upon initialization.
		 * Each item in the array must be of the type that current `ItemManager` can understand.
		 * Default type is `String`.
		 *
		 * @name tags.items
		 * @default null
		 * @author agorbatchev
		 * @date 2011/08/19
		 * @id options.tags.items
		 */
		OPT_ITEMS = 'tags.items',

		/**
		 * @author agorbatchev
		 * @date 2012/08/06
		 */
		OPT_ALLOW_DUPLICATES = 'tags.allowDuplicates',

		/**
		 * HTML source that is used to generate a single tag.
		 *
		 * @name html.tag
		 * @default '<div class="text-tags"/>'
		 * @author agorbatchev
		 * @date 2011/08/19
		 * @id options.html.tag
		 */
		OPT_HTML_TAG  = 'html.tag',

		/**
		 * HTML source that is used to generate container for the tags.
		 *
		 * @name html.tags
		 * @default '<div class="text-tag"><div class="text-button"><span class="text-label"/><a class="text-remove"/></div></div>'
		 * @author agorbatchev
		 * @date 2011/08/19
		 * @id options.html.tags
		 */
		OPT_HTML_TAGS = 'html.tags',

		/**
		 * Tags plugin dispatches or reacts to the following events.
		 *
		 * @author agorbatchev
		 * @date 2011/08/17
		 * @id events
		 */

		/**
		 * Tags plugin triggers the `tagClick` event when user clicks on one of the tags. This allows to process
		 * the click and potentially change the value of the tag (for example in case of user feedback).
		 *
		 *     $('textarea').textext({...}).bind('tagClick', function(e, tag, value, callback)
		 *     {
		 *         var newValue = window.prompt('New value', value);

		 *         if(newValue)
		 *             callback(newValue, true);
		 *     })
		 *
		 *  Callback argument has the following signature:
		 *
		 *     function(newValue, refocus)
		 *     {
		 *         ...
		 *     }
		 *
		 * Please check out [example](/manual/examples/tags-changing.html).
		 *
		 * @name tagClick
		 * @version 1.3.0
		 * @author s.stok
		 * @date 2011/01/23
		 * @id events.tagClick
		 */
		EVENT_TAG_CLICK = 'tagClick',

		EVENT_TAG_REMOVE = 'tagRemove',

		EVENT_TAG_ADD = 'tagAdd',

		DEFAULT_OPTS = {
			tags : {
				enabled         : true,
				items           : null,
				allowDuplicates : true,
				hotKey          : 13
			},

			html : {
				tags : '<div class="text-tags"/>',
				tag  : '<div class="text-tag"><div class="text-button"><span class="text-label"/><a class="text-remove"/></div></div>'
			}
		}
		;

	/**
	 * Initialization method called by the core during plugin instantiation.
	 *
	 * @signature PluginTags.init(core)
	 *
	 * @param core {TextExt} Instance of the TextExt core class.
	 *
	 * @author agorbatchev
	 * @date 2011/08/19
	 * @id init
	 */
	p.init = function(core)
	{
		this.baseInit(core, DEFAULT_OPTS);

		var self  = this,
			input = self.input(),
			container
			;

		if(self.opts(OPT_ENABLED))
		{
			container = $(self.opts(OPT_HTML_TAGS));
			input.after(container);

			$(self).data('container', container);

			self.on({
				backspaceKeyDown : self.onBackspaceKeyDown,
				preInvalidate    : self.onPreInvalidate,
				postInit         : self.onPostInit,
				anyKeyPress      : self.onAnyKeyPress
			});

			self.on(container, {
				click     : self.onClick,
				mousemove : self.onContainerMouseMove
			});

			self.on(input, {
				mousemove : self.onInputMouseMove
			});

			self._hotKey = self.opts(OPT_HOT_KEY);

			self._originalPadding = {
				left : parseInt(input.css('paddingLeft') || 0),
				top  : parseInt(input.css('paddingTop') || 0)
			};

			self._paddingBox = {
				left : 0,
				top  : 0
			};
		}
	};

	/**
	 * Returns HTML element in which all tag HTML elements are residing.
	 *
	 * @signature PluginTags.containerElement()
	 *
	 * @author agorbatchev
	 * @date 2011/08/15
	 * @id containerElement
	 */
	p.containerElement = function()
	{
		return $(this).data('container');
	};

	//--------------------------------------------------------------------------------
	// Event handlers

	/**
	 * Reacts to the `postInit` event triggered by the core and sets default tags
	 * if any were specified.
	 *
	 * @signature PluginTags.onPostInit(e)
	 *
	 * @param e {Object} jQuery event.
	 *
	 * @author agorbatchev
	 * @date 2011/08/09
	 * @id onPostInit
	 */
	p.onPostInit = function(e)
	{
		var self = this;
		self.addTags(self.opts(OPT_ITEMS));
	};

	/**
	 * Reacts to the [`getFormData`][1] event triggered by the core. Returns data with the
	 * weight of 200 to be *greater than the Autocomplete plugin* data weight. The weights
	 * system is covered in greater detail in the [`getFormData`][1] event documentation.
	 *
	 * [1]: /manual/textext.html#getformdata
	 *
	 * @signature PluginTags.onGetFormData(e, data, keyCode)
	 *
	 * @param e {Object} jQuery event.
	 * @param data {Object} Data object to be populated.
	 * @param keyCode {Number} Key code that triggered the original update request.
	 *
	 * @author agorbatchev
	 * @date 2011/08/22
	 * @id onGetFormData
	 */
	p.getFormData = function(callback)
	{
		var self       = this,
			inputValue = self.val(),
			tags       = self.getTags(),
			formValue  = self.itemManager().serialize(tags)
			;

		callback(null, formValue, inputValue);
	};

	/**
	 * Reacts to user moving mouse over the text area when cursor is over the text
	 * and not over the tags. Whenever mouse cursor is over the area covered by
	 * tags, the tags container is flipped to be on top of the text area which
	 * makes all tags functional with the mouse.
	 *
	 * @signature PluginTags.onInputMouseMove(e)
	 *
	 * @param e {Object} jQuery event.
	 *
	 * @author agorbatchev
	 * @date 2011/08/08
	 * @id onInputMouseMove
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
	 *
	 * @signature PluginTags.onContainerMouseMove(e)
	 *
	 * @param e {Object} jQuery event.
	 *
	 * @author agorbatchev
	 * @date 2011/08/08
	 * @id onContainerMouseMove
	 */
	p.onContainerMouseMove = function(e)
	{
		this.toggleZIndex(e);
	};

	/**
	 * Reacts to the `backspaceKeyDown` event. When backspace key is pressed in an empty text field,
	 * deletes last tag from the list.
	 *
	 * @signature PluginTags.onBackspaceKeyDown(e)
	 *
	 * @param e {Object} jQuery event.
	 *
	 * @author agorbatchev
	 * @date 2011/08/02
	 * @id onBackspaceKeyDown
	 */
	p.onBackspaceKeyDown = function(e)
	{
		var self    = this,
			lastTag = self.tagElements().last()
			;

		if(self.val().length == 0)
			self.removeTag(lastTag);
	};

	/**
	 * Reacts to the `preInvalidate` event and updates the input box to look like the tags are
	 * positioned inside it.
	 *
	 * @signature PluginTags.onPreInvalidate(e)
	 *
	 * @param e {Object} jQuery event.
	 *
	 * @author agorbatchev
	 * @date 2011/08/19
	 * @id onPreInvalidate
	 */
	p.onPreInvalidate = function(e)
	{
		var self    = this,
			lastTag = self.tagElements().last(),
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

	/**
	 * Reacts to the mouse `click` event.
	 *
	 * @signature PluginTags.onClick(e)
	 *
	 * @param e {Object} jQuery event.
	 *
	 * @author agorbatchev
	 * @date 2011/08/19
	 * @id onClick
	 */
	p.onClick = function(e)
	{
		var self   = this,
			core   = self.core(),
			source = $(e.target),
			focus  = 0,
			tag
			;

		if(source.is(CSS_DOT_TAGS))
		{
			focus = 1;
		}
		else if(source.is(CSS_DOT_REMOVE))
		{
			self.removeTag(source.parents(CSS_DOT_TAG + ':first'));
			focus = 1;
		}
		else if(source.is(CSS_DOT_LABEL))
		{
			tag = source.parents(CSS_DOT_TAG + ':first');
			self.trigger(EVENT_TAG_CLICK, tag, tag.data(CSS_TAG), tagClickCallback);
		}

		function tagClickCallback(newValue, refocus)
		{
			tag.data(CSS_TAG, newValue);
			tag.find(CSS_DOT_LABEL).text(self.itemManager().itemToString(newValue));

			core.invalidateData();
			core.invalidateBounds();

			if(refocus)
				core.focusInput();
		}

		if(focus)
			core.focusInput();
	};

	/**
	 * Reacts to the `anyKeyUp` event and triggers the `getFormData` to change data that will be submitted
	 * with the form. Default behaviour is that everything that is typed in will be JSON serialized, so
	 * the end result will be a JSON string.
	 *
	 * @signature TextExt.onAnyKeyPress(e)
	 *
	 * @param e {Object} jQuery event.
	 *
	 * @author agorbatchev
	 * @date 2011/08/19
	 * @id onAnyKeyPress
	 */
	p.onAnyKeyPress = function(e, keyCode)
	{
		var self = this,
			core = self.core(),
			val
			;

		if(self._hotKey === keyCode)
		{
			val = self.val();

			if(val && val.length > 0)
			{
				self.itemManager().stringToItem(self.val(), function(err, item)
				{
					self.itemValidator().isValid(item, function(err, isValid)
					{
						if(isValid)
						{
							self.val('');
							self.addTags([ item ]);
							// refocus the textarea just in case it lost the focus
							core.focusInput();
							core.invalidateData();
						}
					});
				});
			}
		}
	};

	//--------------------------------------------------------------------------------
	// Core functionality

	/**
	 * @author agorbatchev
	 * @date 2012/08/06
	 */
	p.hasTag = function(tag)
	{
		var self        = this,
			elements    = this.tagElements(),
			itemManager = self.core().itemManager(),
			item,
			i
			;

		for(i = 0; i < elements.length; i++)
		{
			item = $(elements[i]).data(CSS_TAG);

			if(itemManager.compareItems(item, tag))
				return true;
		}

		return false;
	};

	/**
	 * Creates a cache object with all the tags currently added which will be returned
	 * in the `onGetFormData` handler.
	 *
	 * @signature PluginTags.updateFromTags()
	 *
	 * @author agorbatchev
	 * @date 2011/08/09
	 * @id updateFromTags
	 */
	p.getTags = function()
	{
		var self   = this,
			result = []
			;

		self.tagElements().each(function()
		{
			result.push($(this).data(CSS_TAG));
		});

		return result;
	};

	/**
	 * Toggles tag container to be on top of the text area or under based on where
	 * the mouse cursor is located. When cursor is above the text input and out of
	 * any of the tags, the tags container is sent under the text area. If cursor
	 * is over any of the tags, the tag container is brought to be over the text
	 * area.
	 *
	 * @signature PluginTags.toggleZIndex(e)
	 *
	 * @param e {Object} jQuery event.
	 *
	 * @author agorbatchev
	 * @date 2011/08/08
	 * @id toggleZIndex
	 */
	p.toggleZIndex = function(e)
	{
		var self            = this,
			offset          = self.input().offset(),
			mouseX          = e.clientX - offset.left,
			mouseY          = e.clientY - offset.top,
			box             = self._paddingBox,
			container       = self.containerElement(),
			isOnTop         = container.is(CSS_DOT_TAGS_ON_TOP),
			isMouseOverText = mouseX > box.left && mouseY > box.top
			;

		if(!isOnTop && !isMouseOverText || isOnTop && isMouseOverText)
			container[(!isOnTop ? 'add' : 'remove') + 'Class'](CSS_TAGS_ON_TOP);
	};

	/**
	 * Returns all tag HTML elements.
	 *
	 * @signature PluginTags.tagElements()
	 *
	 * @author agorbatchev
	 * @date 2011/08/19
	 * @id tagElements
	 */
	p.tagElements = function()
	{
		return this.containerElement().find(CSS_DOT_TAG);
	};

	/**
	 * Adds specified tags to the tag list. Triggers `isTagAllowed` event for each tag
	 * to insure that it could be added. Calls `TextExt.getFormData()` to refresh the data.
	 *
	 * @signature PluginTags.addTags(tags)
	 *
	 * @param tags {Array} List of tags that current `ItemManager` can understand. Default
	 * is `String`.
	 *
	 * @author agorbatchev
	 * @date 2011/08/19
	 * @id addTags
	 */
	p.addTags = function(tags)
	{
		if(!tags || tags.length == 0)
			return;

		var self            = this,
			core            = self.core(),
			container       = self.containerElement(),
			allowDuplicates = self.opts(OPT_ALLOW_DUPLICATES),
			nodes           = [],
			node,
			i,
			tag
			;

		for(i = 0; i < tags.length; i++)
		{
			tag  = tags[i];

			if(allowDuplicates || !self.hasTag(tag))
			{
				node = self.renderTag(tag);

				container.append(node);
				nodes.push(node);
			}
		}

		// only trigger events and invalidate if at least one tag was added
		if(nodes.length)
		{
			core.invalidateData();
			core.invalidateBounds();
			self.trigger(EVENT_TAG_ADD, nodes, tags);
		}
	};

	/**
	 * Returns HTML element for the specified tag.
	 *
	 * @signature PluginTags.getTagElement(tag)
	 *
	 * @param tag {Object} Tag object in the format that current `ItemManager` can understand.
	 * Default is `String`.

	 * @author agorbatchev
	 * @date 2011/08/19
	 * @id getTagElement
	 */
	p.getTagElement = function(tag)
	{
		var self = this,
			list = self.tagElements(),
			i, item
			;

		for(i = 0; i < list.length, item = $(list[i]); i++)
			if(self.itemManager().compareItems(item.data(CSS_TAG), tag))
				return item;
	};

	/**
	 * Removes specified tag from the list. Calls `TextExt.getFormData()` to refresh the data.
	 *
	 * @signature PluginTags.removeTag(tag)
	 *
	 * @param tag {Object} Tag object in the format that current `ItemManager` can understand.
	 * Default is `String`.
	 *
	 * @author agorbatchev
	 * @date 2011/08/19
	 * @id removeTag
	 */
	p.removeTag = function(tag)
	{
		var self = this,
			core = self.core(),
			element,
			item
			;

		if(tag instanceof $)
		{
			element = tag;
			tag     = tag.data(CSS_TAG);
		}
		else
		{
			element = self.getTagElement(tag);
		}

		item = element.data(CSS_TAG);

		element.remove();
		core.invalidateData();
		core.invalidateBounds();

		self.trigger(EVENT_TAG_REMOVE, item);
	};

	/**
	 * Creates and returns new HTML element from the source code specified in the `html.tag` option.
	 *
	 * @signature PluginTags.renderTag(tag)
	 *
	 * @param tag {Object} Tag object in the format that current `ItemManager` can understand.
	 * Default is `String`.
	 *
	 * @author agorbatchev
	 * @date 2011/08/19
	 * @id renderTag
	 */
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
