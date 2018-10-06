const minimist  = require('minimist')
const {forAll}  = require('object-recursive-iterator')
const string2js = require('string2js')


module.exports = function(argv)
{
  const args = minimist(argv)

  forAll(args, function(_, key, obj)
  {
    obj[key] = string2js(obj[key])
  })

  return args
}
