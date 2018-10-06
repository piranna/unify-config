const merge           = require('deepmerge')
const urlsearchparams = require('urlsearchparams-to-cli')

const {cliArguments, javascriptify} = require('./lib/util')


/**
 * Unify config from environment variables and URL querystring
 *
 * Unified configuration is available on `process.env` and values already parsed
 * as returned value
 *
 * @return {Object} parsed unified configuration
 */
function config({
  argv = urlsearchparams(),
  env = javascriptify(process.env)
} = {})
{
  // TODO local and upper npm configs

  return merge(
    env,                // environment variables
    cliArguments(argv)  // CLI arguments - higher priority
  )
}


module.exports = config
