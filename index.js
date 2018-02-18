const dotenv   = require('dotenv')
const minimist = require('minimist')


const NPM_PACKAGE_CONFIG_REGEX = /^npm_package_config_(.+)/


function unifyEnv([key, value])
{
  const matches = key.match(NPM_PACKAGE_CONFIG_REGEX)
  if(!matches) return

  const key2 = matches[1]
  if(!this.hasOwnProperty(key2))
    this[key2] = value

  delete this[key]
}

function reduceEnv(acum, [key, value])
{
  try
  {
    value = JSON.parse(value)
  }
  catch(ex){}

  acum[key] = value

  return acum
}


/**
 * Unify config from `package.json`, `.env` file, environment variables and argv
 *
 * Unified configuration is available on `process.env` and values already parsed
 * as returned value
 *
 * @return {Object} parsed unified configuration
 */
function config(argv, options)
{
  if(argv && argv.constructor.name === 'Object')
  {
    options = argv
    argv = null
  }

  const {env} = process

  // dotenv
  const {error} = dotenv.config(options)
  if(error) throw error

  // unify environment variables and npm package config
  Object.entries(env).forEach(unifyEnv, env)

  // argv
  if(!argv) argv = process.argv.slice(2)
  Object.assign(env, minimist(argv))

  // return parsed environment variables
  return Object.entries(env).reduce(reduceEnv, {})
}


module.exports = config
