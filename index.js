const {basename, dirname} = require('path')

const callerCallsite    = require('caller-callsite')
const {all: merge}      = require('deepmerge')
const minimist          = require('minimist')
const {sync: readPkgUp} = require('read-pkg-up')
const string2js         = require('string2js')
const {sync: pkgDir}    = require('pkg-dir')

const envFiles                   = require('./lib/envFiles')
const {reduce_objectFromEntries} = require('./lib/util')


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
    return key.startWith(prefix)
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

function reduceString2js(acum, [key, value])
{
  acum[key] = string2js(value)

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
function config({
  argv = process.argv.slice(2),
  env = Object.entries(process.env).reduce(reduceString2js, {}),
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


module.exports = config
