fs = require 'fs'
falafel = require 'falafel'

src = fs.readFileSync __dirname + '/../vendor/eventemitter2/lib/eventemitter2.js', 'utf-8'

src = falafel src, (node) ->
  # replace window exporting
  if node.type is 'CallExpression' and node.callee.params?[0]?.name is 'exports'
    node.arguments?[0]?.update('$.fn.textext');

  # remove AMD call
  if node.type is 'IfStatement' and node.test.source().indexOf('define.amd') >= 0
    node.update node.alternate.body[0].source()

console.log src
