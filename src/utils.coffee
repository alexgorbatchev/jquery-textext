do (window, $ = jQuery, module = $.fn.textext) ->
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
      currentKey = currentKey.replace /([A-Z])/g, (match) -> '.' + match.toLowerCase()
      result = opts hash, currentKey

    if hasMoreKeys
      if typeof result is 'object'
        result = opts result, key

    result

  module.utils = { opts }
