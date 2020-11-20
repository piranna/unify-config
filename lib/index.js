const {dirname, join} = require('path')

const callerCallsite = require('caller-callsite')
const merge          = require('deepmerge').all
const pkgDir         = require('pkg-dir').sync

const envFiles = require('./envFiles')
const {cliArguments, javascriptify, resolveAliases} = require('./util')


function bindObject([key, value])
{
  this[key] = value
}

function bindProcessEnv([key, value])
{
  this[key] = typeof value === 'string' ? value : JSON.stringify(value)
}

/**
 * Non-global, dependency-only config (when using the module from a dependency)
 */
function dependencyPackageConfig()
{
  // `config` entry at `package.json` of caller module
  const packageDir = pkgDir(dirname(callerCallsite().getFileName()))

  return require(join(packageDir, 'package.json')).config || {}
}

/**
 * Merge `npm` config environment variables when running using `npm` scripts
 */
function npmConfig(env, prefix = 'npm_package_config_')
{
  const entries = Object.entries(env)
  .filter(function([key])
  {
    return key.startsWith(prefix)
  })
  .map(function([key, value])
  {
    return [key.slice(prefix.length), value]
  })

  return Object.fromEntries(entries)
}


/**
 * Unify config from `package.json`, `.env` file, environment variables and argv
 *
 * @return {Object} parsed unified configuration
 */
function config({
  aliases,
  argv = process.argv.slice(2),
  env = javascriptify(process.env),
  parsers,
  path
} = {})
{
  if(parsers instanceof Function) parsers = [parsers]

  const array =
  [
    dependencyPackageConfig(),     // `config` entry at dependency `package.json`
    npmConfig(env),                // `npm` config for project `package.json`
    // ...envFilesDefaults(path),  // defaults from example files (safe mode)
    ...envFiles(parsers)(path),    // dotenv files
    env,                           // environment variables
    cliArguments(argv)             // CLI arguments - higher priority
  ]

  return merge(array.map(resolveAliases, aliases))
}

/**
 * Unify config from `package.json`, `.env` file, environment variables and argv
 *
 * Unified configuration is available on `process.env` and values already parsed
 * as returned value
 *
 * @return {Object} parsed unified configuration
 */
config.bindEnv = function(options)
{
  const {env = process.env} = options

  const func = env.constructor.name === '' ? bindProcessEnv : bindObject

  const result = config(options)

  Object.entries(result).forEach(func, env)

  return result
}


module.exports = config
