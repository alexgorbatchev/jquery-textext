/**
 * jQuery TextExt Plugin
 * http://textextjs.com
 *
 * @version 1.3.0
 * @copyright Copyright (C) 2011-2012 Alex Gorbatchev. All rights reserved.
 * @license MIT License
 */
(function($, undefined)
{
    // Freak out if there's no JSON.stringify function found
    if(!JSON.stringify)
        throw new Error('TextExt.js: `JSON.stringify()` not found');

    /**
     * TextExt is the main core class which by itself doesn't provide any functionality
     * that is user facing, however it has the underlying mechanics to bring all the
     * plugins together under one roof and make them work with each other or on their
     * own.
     *
     * @author agorbatchev
     * @date 2011/08/19
     * @id TextExt
     */
    function TextExt() {};

    var slice     = Array.prototype.slice,
        UNDEFINED = 'undefined',
        p,

        /**
         * TextExt provides a way to pass in the options to configure the core as well as
         * each plugin that is being currently used. The jQuery exposed plugin `$().textext()` 
         * function takes a hash object with key/value set of options. For example:
         *
         *     $('textarea').textext({
         *         enabled: true
         *     })
         *
         * There are multiple ways of passing in the options:
         *
         * ### Hierarchical
         *
         * Options could be nested multiple levels deep and accessed using all lowercased, dot
         * separated style, eg `foo.bar.world`. The manual is using this style for clarity and
         * consistency. For example:
         *
         *        {
         *            item: {
         *                manager: ...
         *            },
         *
         *            html: {
         *                wrap: ...
         *            },
         *
         *            autocomplete: {
         *                enabled: ...,
         *                dropdown: {
         *                   position: ...
         *                }
         *            }
         *        }
         *
         * ### Flat
         *
         * Options could be specified using camel cased names in a flat key/value fashion like so:
         *
         *        {
         *            itemManager: ...,
         *            htmlWrap: ...,
         *            autocompleteEnabled: ...,
         *            autocompleteDropdownPosition: ...
         *        }
         *
         * ### Mixed
         *
         * Finally, options could be specified in mixed style. It's important to understand that
         * for each dot separated name, its alternative in camel case is also checked for, eg for 
         * `foo.bar.world` it's alternatives could be `fooBarWorld`, `foo.barWorld` or `fooBar.world`, 
         * which translates to `{ foo: { bar: { world: ... } } }`, `{ fooBarWorld: ... }`, 
         * `{ foo : { barWorld : ... } }` or `{ fooBar: { world: ... } }` respectively. For example:
         *
         *        {
         *            itemManager : ...,
         *            htmlWrap: ...,
         *            autocomplete: {
         *                enabled: ...,
         *                dropdownPosition: ...
         *            }
         *        }
         *
         * Mixed case is used through out the code, wherever it seems appropriate. However in the code, all option
         * names are specified in the dot notation because it works both ways where as camel case is not
         * being converted to its alternative dot notation.
         *
         * @author agorbatchev
         * @date 2011/08/17
         * @id TextExt.options
         */

        /**
         * Allows to change which [`ItemManager`](core-itemmanager.html) is used to manage this instance of `TextExt`.
         *
         * @name item.manager
         * @default ItemManagerDefault
         * @author agorbatchev
         * @date 2011/08/19
         * @id TextExt.options.item.manager
         */
        OPT_ITEM_MANAGER = 'item.manager',

        /**
         * Allows to change which [`ItemValidator`](core-itemvalidator.html) is used to validate entries in this instance of `TextExt`.
         *
         * @name item.validator
         * @default ItemValidatorDefault
         * @author agorbatchev
         * @date 2012/09/12
         * @id TextExt.options.item.validator
         */
        OPT_ITEM_VALIDATOR = 'item.validator',
        
        /**
         * List of plugins that should be used with the current instance of TextExt. Here are all the ways
         * that you can set this. The order in which plugins are specified is significant. First plugin in 
         * the list that has `getFormData` method will be used as [`dataSource`](#dataSource).
         *
         *     // array
         *     [ 'autocomplete', 'tags', 'prompt' ]
         *
         *     // space separated string
         *     'autocomplete tags prompt'
         *
         *     // comma separated string
         *     'autocomplete, tags, prompt'
         *
         *     // bracket separated string
         *     'autocomplete > tags > prompt'
         *      
         * @name plugins
         * @default []
         * @author agorbatchev
         * @date 2011/08/19
         * @id TextExt.options.plugins
         */
        OPT_PLUGINS = 'plugins',
        
        /**
         * Name of the plugin that will be used as primary data source to populate form data that `TextExt` generates.
         *
         * `TextExt` always tries to automatically determine best `dataSource` plugin to use. It uses the first plugin in the
         * `plugins` option which has `getFormData((function(err, form, input) {})` function. You can always specify
         * exactly which plugin you wish to use either by setting `dataSource` value or by simply adding `*` after
         * the plugin name in the `plugins` option. 
         *
         *     // In this example `autocomplete` will be automatically selected as `dataSource` 
         *     // because it's the first plugin in the list that has `getFormData` method.
         *     $('#text').textext({ plugins : 'autocomplete tags' })
         *
         *     // In this example we specifically set `dataSource` to use `tags` plugin.
         *     $('#text').textext({
         *         plugins    : 'autocomplete tags',
         *         dataSource : 'tags'
         *     })
         *
         *     // Same result as the above using `*` shorthand
         *     $('#text').textext({ plugins : 'autocomplete tags*' })
         *
         * @name dataSource
         * @default null
         * @author agorbatchev
         * @date 2012/09/12
         * @id TextExt.options.dataSource
         */
        OPT_DATA_SOURCE = 'dataSource',

        /**
         * TextExt allows for overriding of virtually any method that the core or any of its plugins
         * use. This could be accomplished through the use of the `ext` option.
         *
         * It's possible to specifically target the core or any plugin, as well as overwrite all the
         * desired methods everywhere.
         *
         *     // Targeting the core:
         *     ext: {
         *         core: {
         *             trigger: function()
         *             {
         *                 console.log('TextExt.trigger', arguments);
         *                 $.fn.textext.TextExt.prototype.trigger.apply(this, arguments);
         *             }
         *         }
         *     }
         *
         *     // In this case we monkey patch currently used instance of the `Tags` plugin.
         *     ext: {
         *         tags: {
         *             addTags: function(tags)
         *             {
         *                 console.log('TextExtTags.addTags', tags);
         *                 $.fn.textext.TextExtTags.prototype.addTags.apply(this, arguments);
         *             }
         *         }
         *     }
         *
         *     // Targeting currently used `ItemManager` instance:
         *     ext: {
         *         itemManager: {
         *             stringToItem: function(str)
         *             {
         *                 console.log('ItemManager.stringToItem', str);
         *                 return $.fn.textext.ItemManager.prototype.stringToItem.apply(this, arguments);
         *             }
         *         }
         *     }
         *
         *     // ... and finally, in edge cases you can extend everything at once:
         *     ext: {
         *         '*': {
         *             fooBar: function() {}
         *         }
         *     }
         *
         * @name ext
         * @default {}
         * @author agorbatchev
         * @date 2011/08/19
         * @id TextExt.options.ext
         */
        OPT_EXT = 'ext',
        
        /**
         * HTML source that is used to generate elements necessary for the core and all other
         * plugins to function.
         *
         * @name html.wrap
         * @default '<div class="text-core"><div class="text-wrap"/></div>'
         * @author agorbatchev
         * @date 2011/08/19
         * @id TextExt.options.html.wrap
         */
        OPT_HTML_WRAP = 'html.wrap',

        /**
         * HTML source that is used to generate hidden input value of which will be submitted 
         * with the HTML form.
         *
         * @name html.hidden
         * @default '<input type="hidden" />'
         * @author agorbatchev
         * @date 2011/08/20
         * @id TextExt.options.html.hidden
         */
        OPT_HTML_HIDDEN = 'html.hidden',

        /**
         * Hash table of key codes and key names for which special events will be created
         * by the core. For each entry a [`[name]KeyDown`](#KeyDown), [`[name]KeyUp`](#KeyUp)
         * and [`[name]KeyPress`](#KeyPress) events will be triggered along side with 
         * [`anyKeyUp`](#anyKeyUp) and [`anyKeyDown`](#anyKeyDown) events for every key stroke.
         *
         * Here's a list of default keys:
         *
         *     {
         *         8   : 'backspace',
         *         9   : 'tab',
         *         13  : 'enter!',
         *         27  : 'escape!',
         *         37  : 'left',
         *         38  : 'up!',
         *         39  : 'right',
         *         40  : 'down!',
         *         46  : 'delete',
         *         108 : 'numpadEnter'
         *     }
         *
         * Please note the `!` at the end of some keys. This tells the core that by default
         * this keypress will be trapped and not passed on to the text input.
         *
         * @name keys
         * @default { ... }
         * @author agorbatchev
         * @date 2011/08/19
         * @id TextExt.options.keys
         */
        OPT_KEYS = 'keys',

        /**
         * The core triggers or reacts to the following events.
         *
         * @author agorbatchev
         * @date 2011/08/17
         * @id TextExt.events
         */

        /**
         * Core triggers `preInvalidate` event before the dimensions of padding on the text input
         * are set.
         *
         * @name preInvalidate
         * @author agorbatchev
         * @date 2011/08/19
         * @id TextExt.events.preInvalidate
         */
        EVENT_PRE_INVALIDATE = 'preInvalidate',

        /**
         * Core triggers `postInvalidate` event after the dimensions of padding on the text input
         * are set.
         *
         * @name postInvalidate
         * @author agorbatchev
         * @date 2011/08/19
         * @id TextExt.events.postInvalidate
         */
        EVENT_POST_INVALIDATE = 'postInvalidate',
        
        /**
         * Core triggers `postInit` event to let plugins run code after all plugins have been 
         * created and initialized. This is a good place to set some kind of global values before 
         * somebody gets to use them. This is not the right place to expect all plugins to finish
         * their initialization.
         *
         * @name postInit
         * @author agorbatchev
         * @date 2011/08/19
         * @id TextExt.events.postInit
         */
        EVENT_POST_INIT = 'postInit',

        /**
         * Core triggers `ready` event after all global configuration and prepearation has been
         * done and the TextExt component is ready for use. Event handlers should expect all 
         * values to be set and the plugins to be in the final state.
         *
         * @name ready
         * @author agorbatchev
         * @date 2011/08/19
         * @id TextExt.events.ready
         */
        EVENT_READY = 'ready',

        /**
         * Core triggers `inputDataChange` event after the value of the visible `<input/>` tag is changed.
         *
         * @name inputDataChange
         * @author agorbatchev
         * @date 2012/09/12
         * @id TextExt.events.inputDataChange
         */
        EVENT_INPUT_DATA_CHANGE = 'inputDataChange',

        /**
         * Core triggers `formDataChange` event after the value of the hidden `<input/>` tag is changed.
         * This hidden tag carries the form value that TextExt produces.
         * 
         * @name formDataChange
         * @author agorbatchev
         * @date 2012/09/12
         * @id TextExt.events.formDataChange
         */
        EVENT_FORM_DATA_CHANGE = 'formDataChange',

        /**
         * Core triggers `anyKeyPress` event for every key pressed.
         * 
         * @name anyKeyPress
         * @author agorbatchev
         * @date 2012/09/12
         * @id TextExt.events.anyKeyPress
         */
        EVENT_ANY_KEY_PRESS = 'anyKeyPress',

        /**
         * Core triggers `anyKeyUp` event for every key up event triggered within the component.
         *
         * @name anyKeyUp
         * @author agorbatchev
         * @date 2011/08/19
         * @id TextExt.events.anyKeyUp
         */

        /**
         * Core triggers `anyKeyDown` event for every key down event triggered within the component.
         *
         * @name anyKeyDown
         * @author agorbatchev
         * @date 2011/08/19
         * @id TextExt.events.anyKeyDown
         */

        /**
         * Core triggers `[name]KeyUp` event for every key specifid in the `keys` option that is 
         * triggered within the component.
         *
         * @name [name]KeyUp
         * @author agorbatchev
         * @date 2011/08/19
         * @id TextExt.events.[name]KeyUp
         */

        /**
         * Core triggers `[name]KeyDown` event for every key specified in the `keys` option that is 
         * triggered within the component.
         *
         * @name [name]KeyDown
         * @author agorbatchev
         * @date 2011/08/19
         * @id TextExt.events.[name]KeyDown
         */

        /**
         * Core triggers `[name]KeyPress` event for every key specified in the `keys` option that is 
         * triggered within the component.
         *
         * @name [name]KeyPress
         * @author agorbatchev
         * @date 2011/08/19
         * @id TextExt.events.[name]KeyPress
         */

        DEFAULT_OPTS = {
            itemManager   : 'default',
            itemValidator : 'default',
            dataSource    : null,
            plugins       : [],
            ext           : {},

            html : {
                wrap   : '<div class="text-core"><div class="text-wrap"/></div>',
                hidden : '<input type="hidden" />'
            },

            keys : {
                8   : 'backspace',
                9   : 'tab',
                13  : 'enter!',
                27  : 'escape!',
                37  : 'left',
                38  : 'up!',
                39  : 'right',
                40  : 'down!',
                46  : 'delete',
                108 : 'numpadEnter'
            }
        }
        ;

    /**
     * Shorthand for executing a function asynchronously at the first possible opportunity.
     *
     * @signature nextTick(callback)
     *
     * @param callback {Function} Callback function to be executed asynchronously.
     *
     * @author agorbatchev
     * @date 2012/09/12
     * @id TextExt.methods.nextTick
     */
    function nextTick(callback)
    {
        setTimeout(callback, 1);
    }

    /**
     * Returns `true` if passed value is a string, `false` otherwise.
     *
     * @signature isString(val)
     *
     * @param val {Anything} Value to be checked.
     *
     * @author agorbatchev
     * @date 2012/09/12
     * @id TextExt.methods.isString
     */
    function isString(val)
    {
        return typeof(val) === 'string';
    }

    /**
     * Returns object property value by name where name is dot-separated and object is multiple levels deep. This is a helper
     * method for retrieving option values from a config object using a single string key.
     *
     * @signature getProperty(source, name)
     *
     * @param source {Object} Source object.
     * @param name {String} Dot separated property name, ie `foo.bar.world`
     *
     * @author agorbatchev
     * @date 2011/08/09
     * @id TextExt.methods.getProperty
     */
    function getProperty(source, name)
    {
        if(isString(name))
            name = name.split('.');

        var fullCamelCaseName = name.join('.').replace(/\.(\w)/g, function(match, letter) { return letter.toUpperCase() }),
            nestedName        = name.shift(),
            result
            ;

        if(typeof(result = source[fullCamelCaseName]) != UNDEFINED)
            result = result;

        else if(typeof(result = source[nestedName]) != UNDEFINED && name.length > 0)
            result = getProperty(result, name);

        // name.length here should be zero
        return result;
    };

    /**
     * Hooks up events specified in the scope of the current object.
     *
     * @signature hookupEvents([target], events)
     *
     * @param target {Object} Optional target object to the scope of which events will be bound. Defaults to current scope if not specified.
     * @param events {Object} Events in the following format : `{ event_name : handler_function() }`.
     *
     * @author agorbatchev
     * @date 2011/08/09
     * @id TextExt.methods.hookupEvents
     */
    function hookupEvents(/* [target], events */)
    {
        var events = slice.apply(arguments),
            self   = this,
            target = args.length === 1 ? self : args.shift(),
            event
            ;

        events = events[0] || {};

        function bind(event, handler)
        {
            target.bind(event, function()
            {
                // apply handler to our PLUGIN object, not the target
                return handler.apply(self, arguments);
            });
        }

        for(name in events)
            bind(name , events[name]);
    };

    //--------------------------------------------------------------------------------
    // TextExt core component

    p = TextExt.prototype;
        
    /**
     * Initializes current component instance with the supplied text input HTML element and options. Upon completion
     * this method triggers [`postInit`](#postInit) event followed by [`ready`](#ready) event.
     *
     * @signature TextExt.init(input, opts)
     *
     * @param input {HTMLElement} Text input HTML dom element.
     * @param opts {Object} Options object.
     *
     * @author agorbatchev
     * @date 2011/08/19
     * @id TextExt.methods.init
     */
    p.init = function(input, opts)
    {
        var self = this,
            hiddenInput,
            container
            ;

        self.defaultOptions = $.extend({}, DEFAULT_OPTS);
        self.userOptions    = opts || {};
        self.plugins        = {};
        self.dataSource     = self.opts(OPT_DATA_SOURCE);
        input               = $(input);
        container           = $(self.opts(OPT_HTML_WRAP));
        hiddenInput         = $(self.opts(OPT_HTML_HIDDEN));

        if(isString(self.selectionKey))
            self.selectionKey = self.selectionKey.charCodeAt(0);

        if(input.is('textarea'))
            input.attr('rows', 1);

        input
            .wrap(container)
            .keydown(function(e) { return self.onKeyDown(e) })
            .keyup(function(e) { return self.onKeyUp(e) })
            .data('textext', self)
            ;

        // keep references to html elements using jQuery.data() to avoid circular references
        $(self).data({
            'hiddenInput' : hiddenInput,
            'wrapElement' : input.parents('.text-wrap').first(),
            'input'       : input
        });

        // set the name of the hidden input to the text input's name
        hiddenInput.attr('name', input.attr('name'));
        // remove name attribute from the text input
        input.attr('name', null);
        // add hidden input to the DOM
        hiddenInput.insertAfter(input);

        $.extend(true, self, self.opts(OPT_EXT + '.*'), self.opts(OPT_EXT + '.core'));
        
        self.originalWidth = input.outerWidth();

        self.initPatches();
        self.initTooling();
        self.initPlugins(self.opts(OPT_PLUGINS), $.fn.textext.plugins);

        self.invalidateBounds();

        nextTick(function()
        {
            self.trigger(EVENT_POST_INIT);
            self.trigger(EVENT_READY);
            self.invalidateData();
        });
    };

    /**
     * Initializes all patches installed via [`addPatch()`](#addPatch) method call.
     *
     * @signature TextExt.initPatches()
     *
     * @author agorbatchev
     * @date 2011/10/11
     * @id TextExt.methods.initPatches
     */
    p.initPatches = function()
    {
        var list   = [],
            source = $.fn.textext.patches,
            name
            ;

        for(name in source)
            list.push(name);

        this.initPlugins(list, source);
    };

    /**
     * Initializes instances of [`ItemManager`](itemmanager.html) and [`ItemValidator`](itemvalidator.html)
     * that are specified via [`itemManager`](#manager) and [`dataSource`](#dataSource) options.
     * 
     * @signature TextExt.initTooling()
     *
     * @author agorbatchev
     * @date 2012/09/12
     * @id TextExt.methods.initTooling
     */
    p.initTooling = function()
    {
        var self          = this,
            itemManager   = self.opts(OPT_ITEM_MANAGER),
            itemValidator = self.opts(OPT_ITEM_VALIDATOR)
            ;

        if(isString(itemManager))
            itemManager = textext.itemManagers[itemManager];

        if(isString(itemValidator))
            itemValidator = textext.itemValidators[itemValidator];

        $.extend(true, itemValidator, self.opts(OPT_EXT + '.itemValidator'));
        $.extend(true, itemManager, self.opts(OPT_EXT + '.itemManager'));

        this.initPlugins(
            'itemManager itemValidator',
            {
                'itemManager'   : itemManager,
                'itemValidator' : itemValidator
            }
        );
    };

    /**
     * Initializes all plugins installed via [`addPlugin()`](#addPlugin) method call.
     *
     * @signature TextExt.initPlugins(plugins, source)
     *
     * @param plugins {Array} List of plugin names to initialize.
     * @param source {Object} Key/value object where a key is plugin name and value is plugin constructor.
     *
     * @author agorbatchev
     * @date 2011/08/19
     * @id TextExt.methods.initPlugins
     */
    p.initPlugins = function(plugins, source)
    {
        var self     = this,
            initList = [],
            ext, 
            name, 
            plugin, 
            i
            ;

        if(isString(plugins))
            plugins = plugins.split(/\s*[,>]\s*|\s+/g);

        function createGetter(name, plugin)
        {
            self[name] = function()
            {
                return plugin;
            };
        }

        for(i = 0; i < plugins.length; i++)
        {
            name = plugins[i];

            if(name.charAt(name.length - 1) === '*')
                self.dataSource = name = name.substr(0, name.length - 1);

            plugin = source[name];

            if(plugin)
            {
                self.plugins[name] = plugin = new plugin();

                initList.push(plugin);
                $.extend(true, plugin, self.opts(OPT_EXT + '.*'), self.opts(OPT_EXT + '.' + name));

                // Create a function on the current instance to get this plugin instance
                // For example for `autocomplete` plugin we will have `textext.autocomplete()`
                // function returning this isntance.
                createGetter(name, plugin);

                plugin.init(self);
            }
            else
            {
                throw new Error('TextExt.js: unknown plugin: ' + name);
            }
        }

        for(i = 0; i < initList.length; i++)
        {
            plugin = initList[i];

            if(!self.dataSource && plugin.getFormData)
                self.dataSource = plugin;

        }
    };

    /**
     * Returns `true` if specified plugin is was instantiated for the current instance of TextExt, `false` otherwise.
     *
     * @signature TextExt.hasPlugin(name)
     *
     * @param name {String} Name of the plugin to check.
     *
     * @author agorbatchev
     * @date 2011/12/28
     * @id TextExt.methods.hasPlugin
     */
    p.hasPlugin = function(name)
    {
        return !!this.plugins[name];
    };

    /**
     * Allows to add multiple event handlers which will be execued in the TextExt instance scope. Same as calling [`hookupEvents(this, ...)`](#hookupEvents).
     * 
     * @signature TextExt.on([target], handlers)
     *
     * @param target {Object} Optional target object to the scope of which events will be bound. Defaults to current scope if not specified.
     * @param events {Object} Events in the following format : `{ event_name : handler_function() }`.
     *
     * @author agorbatchev
     * @date 2011/08/19
     * @id TextExt.methods.on
     */
    p.on = hookupEvents;

    /**
     * Binds an event handler to the HTML dom element that user interacts with. Usually it's the original input element.
     *
     * @signature TextExt.bind(event, handler)
     *
     * @param event {String} Event name.
     * @param handler {Function} Event handler.
     *
     * @author agorbatchev
     * @date 2011/08/19
     * @id TextExt.methods.bind
     */
    p.bind = function(event, handler)
    {
        this.input().bind(event, handler);
    };

    /**
     * Triggers an event on the HTML dom element that user interacts with. Usually it's the original input element. All core events are originated here.
     * 
     * @signature TextExt.trigger(event, ...args)
     *
     * @param event {String} Name of the event to trigger.
     * @param ...args All remaining arguments will be passed to the event handler.
     *
     * @author agorbatchev
     * @date 2011/08/19
     * @id TextExt.methods.trigger
     */
    p.trigger = function()
    {
        var args = arguments;
        this.input().trigger(args[0], slice.call(args, 1));
    };

    /**
     * Returns jQuery input element with which user is interacting with. Usually it's the original input element.
     *
     * @signature TextExt.input()
     *
     * @author agorbatchev
     * @date 2011/08/10
     * @id TextExt.methods.input
     */
    p.input = function()
    {
        return $(this).data('input');
    };

    /**
     * Returns option value for the specified option by name. If the value isn't found in the user
     * provided options, it will try looking for default value. This method relies on [`getProperty`](#getProperty)
     * for most of its functionality.
     *
     * @signature TextExt.opts(name)
     *
     * @param name {String} Option name as described in the options.
     *
     * @author agorbatchev
     * @date 2011/08/19
     * @id TextExt.methods.opts
     */
    p.opts = function(name)
    {
        var result = getProperty(this.userOptions, name);
        return typeof(result) == UNDEFINED ? getProperty(this.defaultOptions, name) : result;
    };

    /**
     * Returns HTML element that was created from the [`html.wrap`](#wrap) option. This is the top level HTML
     * container for the text input with which user is interacting with.
     *
     * @signature TextExt.wrapElement()
     *
     * @author agorbatchev
     * @date 2011/08/19
     * @id TextExt.methods.wrapElement
     */
    p.wrapElement = function()
    {
        return $(this).data('wrapElement');
    };

    /**
     * Updates TextExt elements to match dimensions of the HTML dom text input. Triggers [`preInvalidate`](#preInvalidate) 
     * event before making any changes and [`postInvalidate`](#postInvalidate) event after everything is done.
     *
     * @signature TextExt.invalidateBounds()
     *
     * @author agorbatchev
     * @date 2011/08/19
     * @id TextExt.methods.invalidateBounds
     */
    p.invalidateBounds = function()
    {
        var self      = this,
            input     = self.input(),
            wrap      = self.wrapElement(),
            container = wrap.parent(),
            width     = self.originalWidth,
            height
            ;

        self.trigger(EVENT_PRE_INVALIDATE);

        height = input.outerHeight();

        input.width(width);
        wrap.width(width).height(height);
        container.height(height);

        self.trigger(EVENT_POST_INVALIDATE);
    };

    /**
     * Focuses user input on the text box.
     *
     * @signature TextExt.focusInput()
     *
     * @author agorbatchev
     * @date 2011/08/19
     * @id TextExt.methods.focusInput
     */
    p.focusInput = function()
    {
        this.input()[0].focus();
    };

    /**
     * Returns the hidden input HTML element which will be submitted with the HTML form.
     *
     * @signature TextExt.hiddenInput()
     *
     * @author agorbatchev
     * @date 2011/08/09
     * @id TextExt.methods.hiddenInput
     */
    p.hiddenInput = function(value)
    {
        return $(this).data('hiddenInput');
    };

    /**
     * Updates the values that are displayed in the HTML input box to the user and that will be submitted
     * with the form. Uses [`dataSource`](#dataSource) option to its best ability to determine which plugin
     * acts as the main data source for the current instance. If option isn't set, the first plugin with
     * `getFormData()` method will be used.
     *
     * @signature TextExt.invalidateData(callback)
     *
     * @param callback {Function} Optional callback function that is executed when hidden and visible inputs
     * are updated.
     *
     * @author agorbatchev
     * @date 2011/08/22
     * @id TextExt.methods.invalidateData
     */
    p.invalidateData = function(callback)
    {
        var self        = this,
            dataSource  = self.dataSource,
            key         = 'getFormData',
            plugin,
            getFormData
            ;
        
        function error(msg)
        {
            throw new Error('TextExt.js: ' + msg);
        }

        if(!dataSource)
            error('no `dataSource` set and no plugin supports `getFormData`');

        if(isString(dataSource))
        {
            plugin = self.plugins[dataSource];
            
            if(!plugin)
                error('`dataSource` plugin not found: ' + dataSource);
        }
        else
        {
            if(dataSource instanceof textext.Plugin)
            {
                plugin     = dataSource;
                dataSource = null;
            }
        }

        if(plugin && plugin[key])
            // need to insure `dataSource` below is executing with plugin as plugin scop and
            // if we just reference the `getFormData` function it will be in the window scope.
            getFormData = function()
            {
                plugin[key].apply(plugin, arguments);
            };

        if(!getFormData)
            error('specified `dataSource` plugin does not have `getFormData` function: ' + dataSource);

        nextTick(function()
        {
            getFormData(function(err, form, input)
            {
                self.inputValue(input);
                self.formValue(form);

                callback && callback();
            });
        });
    };

    /**
     * Gets or sets visible HTML elment's value. This method could be used by a plugin to change displayed value
     * in the input box. After the value is changed, triggers the [`inputDataChange`](#inputDataChange) event.
     *
     * @signature TextExt.inputValue([value])
     *
     * @param value {Object} Optional value to set. If argument isn't supplied, method returns current value instead.
     *
     * @author agorbatchev
     * @date 2011/08/22
     * @id TextExt.methods.inputValue
     */
    p.inputValue = function(value)
    {
        var self  = this,
            input = self.input()
            ;

        if(typeof(value) === UNDEFINED)
            return self._inputValue;

        if(self._inputValue !== value)
        {
            input.val(value);
            self._inputValue = value;
            self.trigger(EVENT_INPUT_DATA_CHANGE, value);
        }
    };

    /**
     * Gets or sets hidden HTML elment's value. This method could be used by a plugin to change value submitted
     * with the form. After the value is changed, triggers the [`formDataChange`](#formDataChange) event.
     *
     * @signature TextExt.formValue([value])
     *
     * @param value {Object} Optional value to set. If argument isn't supplied, method returns current value instead.
     * 
     * @author agorbatchev
     * @date 2011/08/22
     * @id TextExt.methods.formValue
     */
    p.formValue = function(value)
    {
        var self        = this,
            hiddenInput = self.hiddenInput()
            ;

        if(typeof(value) === UNDEFINED)
            return self._formValue;

        if(self._formValue !== value)
        {
            self._formValue = value;
            hiddenInput.val(value);
            self.trigger(EVENT_FORM_DATA_CHANGE, value);
        }
    };
    
    //--------------------------------------------------------------------------------
    // Event handlers

    //--------------------------------------------------------------------------------
    // User mouse/keyboard input

    /**
     * Triggers [`[name]KeyUp`](#KeyUp), [`[name]KeyPress`](#KeyPress) and [`anyKeyPress`](#anyKeyPress) 
     * for every keystroke.
     *
     * @signature TextExt.onKeyUp(e)
     *
     * @param e {Object} jQuery event.
     *
     * @author agorbatchev
     * @date 2011/08/19
     * @id TextExt.methods.onKeyUp
     */

    /**
     * Triggers `[name]KeyDown` for every keystroke as described in the events.
     *
     * @signature TextExt.onKeyDown(e)
     *
     * @param e {Object} jQuery event.
     *
     * @author agorbatchev
     * @date 2011/08/19
     * @id TextExt.methods.onKeyDown
     */
    
    $(['Down', 'Up']).each(function()
    {
        var type = this.toString();

        p['onKey' + type] = function(e)
        {
            var self          = this,
                keyName       = self.opts(OPT_KEYS)[e.keyCode],
                defaultResult = true
                ;

            if(keyName)
            {
                defaultResult = keyName.substr(-1) != '!';
                keyName       = keyName.replace('!', '');

                self.trigger(keyName + 'Key' + type);

                // manual *KeyPress event fimplementation for the function keys like Enter, Backspace, etc.
                if(type == 'Up' && self._lastKeyDown == e.keyCode)
                {
                    self._lastKeyDown = null;
                    self.trigger(keyName + 'KeyPress');
                    self.trigger(EVENT_ANY_KEY_PRESS, e.keyCode);
                }

                if(type == 'Down')
                    self._lastKeyDown = e.keyCode;
            }

            self.trigger('anyKey' + type, e.keyCode);

            return defaultResult;
        };
    });

    //--------------------------------------------------------------------------------
    // jQuery Integration
    
    /**
     * TextExt integrates as a jQuery plugin available through the `$(selector).textext(opts)` call. If
     * `opts` argument is passed, then a new instance of `TextExt` will be created for all the inputs
     * that match the `selector`. If `opts` wasn't passed and TextExt was already intantiated for 
     * inputs that match the `selector`, array of `TextExt` instances will be returned instead.
     *
     *     // will create a new instance of `TextExt` for all elements that match `.sample`
     *     $('.sample').textext({ ... });
     *
     *     // will return array of all `TextExt` instances
     *     var list = $('.sample').textext();
     *
     * The following properties are also exposed through the jQuery `$.fn.textext`:
     *
     * * `TextExt` -- `TextExt` class.
     * * [`Plugin`](core-plugin.html) -- `Plugin` class.
     * * [`ItemManager`](core-itemmanager.html) -- `ItemManager` class.
     * * [`ItemValidator`](core-itemvalidator.html) -- `ItemValidator` class.
     * * `plugins` -- Key/value table of all registered plugins.
     * * [`addPlugin(name, constructor)`](#addPlugin) -- All plugins should register themselves using this function.
     * * [`addPatch(name, constructor)`](#addPatch) -- All patches should register themselves using this function.
     * * [`addItemManager(name, constructor)`](#addItemManager) -- All item managers should register themselves using this function.
     * * [`addItemValidator(name, constructor)`](#addItemValidator) -- All item validators should register themselves using this function.
     *
     * @author agorbatchev
     * @date 2011/08/19
     * @id TextExt.jquery
     */

    var cssInjected = false;

    var textext = $.fn.textext = function(opts)
    {
        var css;
        
        if(!cssInjected && (css = $.fn.textext.css) != null)
        {
            $('head').append('<style>' + css + '</style>');
            cssInjected = true;
        }

        return this.map(function()
        {
            var self = $(this);

            if(opts == null)
                return self.data('textext');

            var instance = new TextExt();

            instance.init(self, opts);
            self.data('textext', instance);

            return instance.input()[0];
        });
    };

    /**
     * This static function registers a new plugin which makes it available through the `plugins` option
     * to the end user. The name specified here is the name the end user would put in the `plugins` option
     * to add this plugin to a new instance of TextExt.
     * 
     * @signature $.fn.textext.addPlugin(name, constructor)
     *
     * @param name {String} Name of the plugin which it will be identified in the options by.
     * @param constructor {Function} Plugin constructor.
     *
     * @author agorbatchev
     * @date 2011/10/11
     * @id TextExt.methods.addPlugin
     */
    textext.addPlugin = function(name, constructor)
    {
        textext.plugins[name] = constructor;
        constructor.prototype = new textext.Plugin();
    };

    /**
     * This static function registers a new patch which is added to each instance of TextExt. If you are
     * adding a new patch, make sure to call this method.
     * 
     * @signature $.fn.textext.addPatch(name, constructor)
     *
     * @param name {String} Name of the patch.
     * @param constructor {Function} Patch constructor.
     *
     * @author agorbatchev
     * @date 2012/10/27
     * @id TextExt.methods.addPatch
     */
    textext.addPatch = function(name, constructor)
    {
        textext.patches[name] = constructor;
        constructor.prototype = new textext.Plugin();
    };

    /**
     * This static function registers a new [`ItemManager`](core-itemmanager.html) is then could be used 
     * by a new TextExt instance.
     * 
     * @signature $.fn.textext.addItemManager(name, constructor)
     *
     * @param name {String} Name of the item manager which it will be identified in the options by.
     * @param constructor {Function} Item Manager constructor.
     *
     * @author agorbatchev
     * @date 2012/10/27
     * @id TextExt.methods.addItemManager
     */
    textext.addItemManager = function(name, constructor)
    {
        textext.itemManagers[name] = constructor;
        constructor.prototype      = new textext.ItemManager();
    };

    /**
     * This static function registers a new [`ItemValidator`](core-itemvalidator.html) is then could be used 
     * by a new TextExt instance.
     * 
     * @signature $.fn.textext.addItemValidator(name, constructor)
     *
     * @param name {String} Name of the item validator which it will be identified in the options by.
     * @param constructor {Function} Item Validator constructor.
     *
     * @author agorbatchev
     * @date 2012/10/27
     * @id TextExt.methods.addItemValidator
     */
    textext.addItemValidator = function(name, constructor)
    {
        textext.itemValidators[name] = constructor;
        constructor.prototype        = new textext.ItemValidator();
    };

    textext.TextExt        = TextExt;
    textext.plugins        = {};
    textext.patches        = {};
    textext.itemManagers   = {};
    textext.itemValidators = {};
})(jQuery);

