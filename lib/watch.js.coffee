fs = require 'fs'
falafel = require 'falafel'

src = fs.readFileSync __dirname + '/../vendor/watchjs/src/watch.js', 'utf-8'

src = falafel src, (node) ->
  if node.type is 'Literal' and node.value is 'use strict'
    node.update ''

  # remove first function expression where it defines modules and exports to the window
  if node.type is 'FunctionExpression' and node.params?[0]?.name is 'factory'
    node.update('function(factory) { $.fn.textext.WatchJS = factory(); }')

  # only keep modern browser implementation
  if node.type is 'IfStatement' and node.test?.source() is 'isModernBrowser()'
    node.update node.consequent.source()

  # remove function to test for modern browser
  if node.type is 'VariableDeclarator' and node.id?.name is 'isModernBrowser'
    node.parent.update ''

console.log src
