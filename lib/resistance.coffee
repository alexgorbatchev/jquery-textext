fs = require 'fs'
falafel = require 'falafel'
assert = require 'assert'

src = fs.readFileSync __dirname + '/../vendor/resistance/lib/resistance.js', 'utf-8'

src = """
$.fn.textext.resistance = (function()
{

#{src}

})();

"""

actions = { results : 0, callback : 0, returns : 0, errcheck : 0 }

src = falafel src, (node) ->
  # update success callback to take `err`
  if node.type is 'FunctionExpression' and node.params?[0]?.name is 'results'
    actions.results++
    node.update node.source().replace '(results)', '(err, results)'

  # update the check so that it takes `err` into account
  if node.source() is '++completed'
    actions.errcheck++
    node.update "err || #{node.source()}"

  # update callback so that it has `err` as the first argument
  if node.type is 'CallExpression' and node.callee.source() is 'callback.apply'
    actions.callback++
    node.update 'callback.apply(data, [ err ].concat(data))'

  # replace R variable with return
  if node.type is 'VariableDeclarator' and node.id?.name is 'R'
    actions.returns++
    node.parent.update 'return ' + node.init.source()

# spot check
assert actions.results is 2
assert actions.callback is 2
assert actions.errcheck is 2
assert actions.returns is 1

console.log src
