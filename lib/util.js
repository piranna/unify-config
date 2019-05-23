const minimist  = require('minimist')
const {forAll}  = require('object-recursive-iterator')
const string2js = require('string2js')


function cliArguments(argv)
{
  const args = minimist(argv)

  forAll(args, iterArgs)

  return args
}

function iterArgs(_, key, obj)
{
  obj[key] = string2js(obj[key])
}

function javascriptify(data)
{
  return Object.entries(data).reduce(reduceString2js, {})
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


exports.cliArguments   = cliArguments
exports.javascriptify  = javascriptify
exports.resolveAliases = resolveAliases
