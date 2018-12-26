const merge           = require('deepmerge').all
const urlsearchparams = require('urlsearchparams-to-cli')

const {cliArguments, javascriptify, resolveAliases} = require('./lib/util')


/**
 * Unify config from environment variables and URL querystring
 *
 * Unified configuration is available on `process.env` and values already parsed
 * as returned value
 *
 * @return {Object} parsed unified configuration
 */
function config({
  aliases,
  argv = urlsearchparams(),
  env = javascriptify(process.env)
} = {})
{
  // TODO local and upper npm configs

  const array =
  [
    env,                // environment variables
    cliArguments(argv)  // CLI arguments - higher priority
  ]

  return merge(array.map(resolveAliases, aliases))
}


module.exports = config
