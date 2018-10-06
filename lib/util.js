const minimist  = require('minimist')
const {forAll}  = require('object-recursive-iterator')
const string2js = require('string2js')


function cliArguments(argv)
{
  const args = minimist(argv)

  forAll(args, function(_, key, obj)
  {
    obj[key] = string2js(obj[key])
  })

  return args
}

function javascriptify(data)
{
  return Object.entries(data).reduce(reduceString2js, {})
}

function reduce_objectFromEntries(acum, [key, value])
{
  acum[key] = value

  return acum
}

function reduceString2js(acum, [key, value])
{
  acum[key] = string2js(value)

  return acum
}


exports.cliArguments             = cliArguments
exports.javascriptify            = javascriptify
exports.reduce_objectFromEntries = reduce_objectFromEntries
