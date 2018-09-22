const {basename, dirname} = require('path')

const callerCallsite    = require('caller-callsite')
const {all: merge}      = require('deepmerge')
const minimist          = require('minimist')
const {sync: readPkgUp} = require('read-pkg-up')
const {sync: pkgDir}    = require('pkg-dir')

const envFiles                                  = require('./envFiles')
const {javascriptify, reduce_objectFromEntries} = require('./util')


const appRootPath = require('app-root-path').toString()


/**
 * Non-global, dependency-only config (when using the module from a dependency)
 */
function dependencyNpmConfig(env)
{
  const packageDir  = pkgDir(dirname(callerCallsite().getFileName()))
  const packageName = basename(packageDir)

  // Merge `npm` config environment variables targetting the caller module
  return npmConfig(env, packageName+'/')
}

/**
 * Non-global, dependency-only config (when using the module from a dependency)
 */
function dependencyPackageConfig(env)
{
  const packageDir = pkgDir(dirname(callerCallsite().getFileName()))

  // `config` entry at `package.json` of caller module
  return packageConfig(packageDir)
}

/**
 * Merge `npm` config environment variables when running using `npm` scripts
 */
function npmConfig(env, prefix = 'npm_package_config_')
{
  return Object.entries(env)
  .filter(function([key, value])
  {
    return key.startsWith(prefix)
  })
  .map(function([key, value])
  {
    return [key.slice(prefix.length), value]
  })
  .reduce(reduce_objectFromEntries, {})
}

function packageConfig(cwd)
{
  const {pkg: {config = {}} = {}} = readPkgUp({cwd})

  return config
}


/**
 * Unify config from `package.json`, `.env` file, environment variables and argv
 *
 * Unified configuration is available on `process.env` and values already parsed
 * as returned value
 *
 * @return {Object} parsed unified configuration
 */
function config({
  argv = process.argv.slice(2),
  env = javascriptify(process.env),
  parsers,
  path
} = {})
{
  return merge([
    dependencyPackageConfig(env),  // `config` entry at dependency `package.json`
    dependencyNpmConfig(env),      // npm config for that dependency
    packageConfig(appRootPath),    // `config` entry at project `package.json`
    npmConfig(env),                // npm config
    // ...envFilesDefaults(path),  // defaults from example files (safe mode)
    ...envFiles(parsers)(path),    // dotenv files
    env,                           // environment variables
    minimist(argv)                 // CLI arguments - higher priority
  ])
}

function bindProcessEnv([key, value])
{
  this[key] = typeof value === 'string' ? value : JSON.stringify(value)
}

function bindObject([key, value])
{
  this[key] = value
}

config.bindEnv = function(options)
{
  const {env = process.env} = options

  const func = env.constructor.name === '' ? bindProcessEnv : bindObject

  const result = config(options)

  Object.entries(result).forEach(func, env)

  return result
}


module.exports = config
