### About

TextExt is a plugin for jQuery which is designed to provide functioanlity such
as tag input and autocomplete.

The core design principle behind TextExt is modularity and extensibility. Each
piece of functionality is separated from the main core and can act individually
and together with other plugins.

The benifits of this approach is that not only you can easily configure an input
to provide just the functionality that you need, but that all other code that 
you aren't using doesn't need to be loaded at all.

A wide number of plugins are available including Tags, Autocomplete, Filter, Ajax
as well as a few which are purely asthetical like Focus.

Please refer to the [manual] for the full API documentation and examples.

### Example

    <textarea id="textarea" rows="1"></textarea>

    <script type="text/javascript">
        $('#textarea').textext({
            plugins : 'tags prompt focus autocomplete ajax',
            tagsItems : [ 'jquery', 'plugin', 'tags', 'autocomplete' ],
            prompt : 'Add one...',
            ajax : {
                url : '/manual/examples/data.json',
                dataType : 'json',
                cacheResults : true
            }
        });
    </script>

### How To Use

The steps to using TextExt are as follows:

1. Specify which plugins you need via the `plugins` option
2. Configure each plugin individually if necessary
3. Enjoy!

### License

The TextExt component is released under the open source commercial license. This
means that while the source is open to anyone for viewing and modification, you
have to [purchase] a commercial license if you intend to use TextExt.

All source contributions automatically become part of the TextExt source if
accepted and the original author shall give up any further claim.

[manual]: /manual/index.html
[purchase]: /purchase.html

