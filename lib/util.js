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

function resolveAliases(obj)
{
  // TODO do overwrittes in deterministic order
  for(const [src, dest] of Object.entries(this))
  {
    let value = obj[src]
    if(value === undefined) continue

    if(dest instanceof Function)
    {
      value = dest(value)

      if(value.constructor.name === 'Object') resolveAliases.call(value, obj)
    }

    if(obj[dest] === undefined) obj[dest] = value

    delete obj[src]
  }

  return obj
}


exports.cliArguments             = cliArguments
exports.javascriptify            = javascriptify
exports.reduce_objectFromEntries = reduce_objectFromEntries
exports.resolveAliases           = resolveAliases
