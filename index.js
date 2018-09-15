const {dirname} = require('path')

const appRootPath       = require('app-root-path')
const callerCallsite    = require('caller-callsite')
const merge             = require('deepmerge')
const dotenv            = require('dotenv')
const {sync: findUp}    = require('find-up')
const minimist          = require('minimist')
const {sync: readPkgUp} = require('read-pkg-up')
const string2js         = require('string2js')


const NPM_PACKAGE_CONFIG_REGEX = /^npm_package_config_(.+)/


function npmConfig(env)
{
  // Merge `npm` config environment variables when running using `npm` scripts
  if(process.env.npm_config_argv)
    Object.entries(env).forEach(unifyEnv, env)

  // `config` entry at project root `package.json` (in case not using `npm run`)
  else
    unifyPackageConfig(env, appRootPath.toString())
}

function parseEnv(env)
{
  return Object.entries(env).reduce(reduceEnv, {})
}

function reduceEnv(acum, [key, value])
{
  acum[key] = string2js(value)

  return acum
}

// Add environment variable if it's not already set
function unifyConfig([key, value])
{
  if(this.hasOwnProperty(key)) return

  this[key] = typeof value === 'string' ? value : JSON.stringify(value)
}

function unifyEnv([key, value])
{
  const matches = key.match(NPM_PACKAGE_CONFIG_REGEX)
  if(!matches) return

  // Add `npm` config variable if the same environment one is not already set
  unifyConfig([matches[1], value])

  delete this[key]
}

function unifyPackageConfig(env, cwd)
{
  const {pkg: {config = {}} = {}} = readPkgUp({cwd})
  Object.entries(config).forEach(unifyConfig, env)
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

  const {env = process.env, path} = options || {}

  // argv - higher priority over environment variables
  if(!argv) argv = process.argv.slice(2)
  for(let [key, value] of Object.entries(minimist(argv)))
  {
    let orig = env[key]
    if(orig != null)
    {
      if(env.constructor.name !== 'object') orig = string2js(orig)
      value = merge(orig, value)
    }

    env[key] = typeof value === 'string' ? value : JSON.stringify(value)
  }

  // dotenv
  const {error} = dotenv.config({path: path || findUp('.env')})
  if(error && error.code !== 'ENOENT') throw error

  // npm config
  npmConfig(env)


  // `config` entry at `package.json` of caller module (for dependencies)
  unifyPackageConfig(env, dirname(callerCallsite().getFileName()))

  // return parsed environment variables
  return parseEnv(env)
}

config.parseEnv = parseEnv


module.exports = config
