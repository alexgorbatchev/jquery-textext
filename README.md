# Version 2.0 in development

Please note that there's version 2.0 in active development. Checkout the #2.0.0-wip 
branch for more fun action! CoffeeScript and full Jasmine coverage - fun stuff!

## About

TextExt is a plugin for jQuery which is designed to provide functionality such
as tag input and autocomplete.

The core design principle behind TextExt is modularity and extensibility. Each
piece of functionality is separated from the main core and can act individually
or together with other plugins.

TextExt's modular design allows you easily turn a standard HTML text input into a 
wide range of modern, tailored to your needs input field without bloating your 
source code and slowing down your site with the code that you aren't using.

A wide number of plugins are available including Tags, Autocomplete, Filter, Ajax
as well as a few which are purely aesthetic like Focus.

Please refer to the [manual] for the full API documentation and examples.

## Features

* Tags
* Autocomplete
* AJAX loading
* Placeholder text
* Arrow
* ... and much more!

## Example
```html
<textarea id="textarea" rows="1"></textarea>

<script type="text/javascript">
    $('#textarea').textext({
        plugins : 'tags prompt focus autocomplete ajax arrow',
        tagsItems : [ 'Basic', 'JavaScript', 'PHP', 'Scala' ],
        prompt : 'Add one...',
        ajax : {
            url : '/manual/examples/data.json',
            dataType : 'json',
            cacheResults : true
        }
    });
</script>
```

## How To Use

The steps to using TextExt are as follows:

1. Specify which plugins you need via the `plugins` option
2. Configure each plugin individually if necessary
3. Enjoy!

## History

### 1.3.1

#### Bug Fixes
* Fixed jQuery 1.8.x compatability ([issue #74](https://github.com/alexgorbatchev/jquery-textext/issues/74)).

### 1.3.0

#### New Features
* Added `tagClick` event to the tags plugin 
  ([issue #13](https://github.com/alexgorbatchev/jquery-textext/pull/13)).
  See the [example](http://textextjs.com/manual/examples/tags-click.html).
* Prompt plugin now checks `placeholder` attribute
  ([issue #8](https://github.com/alexgorbatchev/jquery-textext/pull/8)).
  See the [example](http://textextjs.com/manual/examples/prompt-from-placeholder.html).
* Clicking on item in autocomplete will automatically add that item to tags
  [#2](https://github.com/alexgorbatchev/jquery-textext/issues/2).

#### Bug Fixes
* Fixes getter methods created when plugins are initialized.
  ([issue #20](https://github.com/alexgorbatchev/jquery-textext/pull/20)).
* Fixed issues 
  [#4](https://github.com/alexgorbatchev/jquery-textext/issues/4),
  [#4](https://github.com/alexgorbatchev/jquery-textext/issues/5) and
  [#10](https://github.com/alexgorbatchev/jquery-textext/issues/5)
  related to the mouse issues in the autocomplete dropdown.
* Fixed `textext.[pluginName]()`
  ([issue #20](https://github.com/alexgorbatchev/jquery-textext/pull/20)).

### 1.2.0
* Added ability to get instances of plugins to call methods on them directy 
  ([issue #6](https://github.com/alexgorbatchev/jquery-textext/issues/6)).
  See the [example](http://textextjs.com/manual/examples/tags-adding.html).

### 1.1.0

#### New Features
* Added `autocomplete.render` option for custom rendering. See the
  [manual](http://textextjs.com/manual/plugins/autocomplete.html#autocomplete-render) and 
  [example](http://textextjs.com/manual/examples/autocomplete-with-custom-render.html).
* Added `autocomplete.dropdown.maxHeight` option for setting height of the dropdown. See
  [manual](http://textextjs.com/manual/plugins/autocomplete.html#autocomplete-dropdown-maxheight) and 
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
and support the project through a donation.

## Contributors

Alphabetically:

* [adamayres](http://github.com/adamayres) (Adam Ayres)
* [alexyoung](http://github.com/alexyoung) (Alex Young)
* [cmer](http://github.com/cmer) (Carl Mercier)
* [deefour](http://github.com/deefour) (Jason Daly)
* [KoernerWS](http://github.com/KoernerWS) (Florian Koerner)
* [sstok](http://github.com/sstok) (Sebastiaan Stok)

[manual]: http://textextjs.com/manual/index.html

