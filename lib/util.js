const string2js = require('string2js')


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


exports.javascriptify            = javascriptify
exports.reduce_objectFromEntries = reduce_objectFromEntries
