do (window, $ = jQuery, module = $.fn.textext) ->
  prop = (object, name, desc) -> Object.defineProperty object, name, desc

  series = (jobs, callback) ->
    return callback() if jobs.length is 0

    completed = 0
    data = []

    iterate = ->
      jobs[completed] (err, results) ->
        data[completed] = results

        if ++completed is jobs.length or err
          callback err, data
        else
          iterate()

    iterate()

  parallel = (jobs, callback) ->
    length = jobs.length

    return callback() if length is 0

    completed = 0
    data = []

    for index in [0..length]
      do (index) ->
        jobs[index] (err, results) ->
          data[index] = results

          if ++completed is length or err?
            callback err, data

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

    (str, data, callback) -> nextTick ->
      try
        result = tmpl str, data
      catch e
        err = e

      callback err, result

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

  $.extend module, { opts, prop, throttle, nextTick, template, series, parallel }
