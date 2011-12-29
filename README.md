## About

TextExt is a plugin for jQuery which is designed to provide functionality such
as tag input and autocomplete.

The core design principle behind TextExt is modularity and extensibility. Each
piece of functionality is separated from the main core and can act individually
or together with other plugins.

TextExt's modular design allows you easily turn a standard HTML text input into a 
wide range of modern, taylored to your needs input field without bloating your 
source code and slowing down your site with the code that you aren't using.

A wide number of plugins are available including Tags, Autocomplete, Filter, Ajax
as well as a few which are purely asthetical like Focus.

Please refer to the [manual] for the full API documentation and examples.

## Features

* Tags
* Autocomplete
* AJAX loading
* Placeholder text

## Example

    <textarea id="textarea" rows="1"></textarea>

    <script type="text/javascript">
        $('#textarea').textext({
            plugins : 'tags prompt focus autocomplete ajax arrow',
            tagsItems : [ 'jquery', 'plugin', 'tags', 'autocomplete' ],
            prompt : 'Add one...',
            ajax : {
                url : '/manual/examples/data.json',
                dataType : 'json',
                cacheResults : true
            }
        });
    </script>

## How To Use

The steps to using TextExt are as follows:

1. Specify which plugins you need via the `plugins` option
2. Configure each plugin individually if necessary
3. Enjoy!

## History

### 1.1.0

#### New Features
* Added `autocomplete.render` option for custom rendering. See the
  [manual](http://textextjs.com/manual/plugins/autocomplete.html#autocomplete-render) and 
  [example](http://textextjs.com/manual/examples/autocomplete-with-custom-render.html).
* Added [Arrow plugin](http://textextjs.com/manual/plugins/arrow.html).
* Switched to MIT license.

#### Bug Fixes
* TextExt core now works with `<input/>` tags.
* Filter plugin now works without Tags.
* Fixed clicking on suggestion in autocomplete dropdown.

### 1.0.0
* Initial release.

## License

The TextExt component is released under the open source MIT. This means that you
can use it any way you want, but I would very much appreciate if you take a minute
and support the project through a [donation].

[manual]: http://textextjs.com/manual/index.html
[donation]: http://textextjs.com/donate.html

