const merge           = require('deepmerge').all
const urlsearchparams = require('urlsearchparams-to-cli')

const {cliArguments, javascriptify, resolveAliases} = require('./lib/util')


/**
 * Unify config from environment variables and URL querystring
 *
 * Browser specific version taking in account only CLI arguments, fetching them
 * by default from the URL query string. All static default values and dotenv
 * configs must be already provided as hardcoded values in environment
 * variables at `process.env`
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
