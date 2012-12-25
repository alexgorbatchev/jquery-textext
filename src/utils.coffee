do (window, $ = jQuery, module = $.fn.textext) ->
  prop = (object, name, desc) -> Object.defineProperty object, name, desc

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

  $.extend module, { opts, prop, nextTick }
