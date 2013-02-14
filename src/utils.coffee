do (window, $ = jQuery, module = $.fn.textext) ->
  deferred = (fn) ->
    d = $.Deferred()
    d.fail (err) -> console?.error err or 'Promise rejected by ' + fn.toString()
    fn d
    d.promise()

  parallel = (deferreds) ->
    $.when.apply null, deferreds

  series = (args...) -> deferred (d) ->
    deferreds = if args.length is 1 then args[0] else args
    index     = 0

    iterate = ->
      fn = deferreds[index++]
      return d.resolve() unless fn?
      fn.then iterate, (err) -> d.fail(err)

    iterate()

  template = do ->
    cache = {}

    # Simple JavaScript Templating
    # John Resig - http://ejohn.org/ - MIT Licensed

    tmpl = (str, data) ->
      fn = cache[str]

      unless fn?
        # Generate a reusable function that will serve as a template generator (and which will be cached).
        str = str.replace(/[\r\t\n]/g, " ")
          .split("<%").join("\t")
          .replace(/((^|%>)[^\t]*)'/g, "$1\r")
          .replace(/\t=(.*?)%>/g, "',$1,'")
          .split("\t").join("');")
          .split("%>").join("p.push('")
          .split("\r").join("\\'")

        fn = cache[str] = new Function "obj", "var p=[],print=function(){p.push.apply(p,arguments);};with(obj){p.push('#{str}');}return p.join('');"

      return fn(data)

    (str, data, callback) -> deferred (d) ->
      try
        d.resolve tmpl str, data
      catch e
        d.fail e

  opts = (hash, key) ->
    return unless hash?

    if typeof key is 'string'
      return hash[key] if hash.hasOwnProperty key
      key = key.split(/[\.\-_]/g)

    currentKey = key.shift()
    hasMoreKeys = key.length > 0

    if hash.hasOwnProperty currentKey
      result = hash[currentKey]
    else
      newKey = currentKey.replace /([A-Z])/g, (match) -> '.' + match.toLowerCase()
      result = opts hash, newKey if newKey isnt currentKey

    if hasMoreKeys
      if typeof result is 'object'
        result = opts result, key

    result

  nextTick = (task) -> setTimeout task, 0

  throttle = (fn, context, delay = 200) ->
    id = null

    (args...) ->
      clearTimeout id
      id = setTimeout (-> fn.apply context or null, args), delay

  $.extend module, { opts, throttle, nextTick, template, deferred, parallel, series }
